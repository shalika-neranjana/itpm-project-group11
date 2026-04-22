import { test, expect } from '@playwright/test';

test.describe('Monthly Report Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login by setting token in localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('student', JSON.stringify({
        studentId: 'ST123',
        firstName: 'Test',
        lastName: 'Student'
      }));
    });

    // Mock internships list
    await page.route(/\/api\/my-internships\/student\/.*/, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { 
            _id: 'int123', 
            title: 'Test Internship', 
            specialization: 'Software Engineering',
            studentName: 'Test Student',
            status: 'ongoing',
            startDate: '2023-01-01',
            duration: 6,
            supervisorEmail: 'supervisor@example.com',
            supervisorName: 'Mr. Supervisor'
          }
        ])
      });
    });

    // Mock monthly reports
    await page.route(/\/api\/monthly-reports\/internship\/.*/, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: 'report1',
            month: 'October 2023',
            weekSummary: {
              week01: 'Did A',
              week02: 'Did B',
              week03: 'Did C',
              week04: 'Did D'
            },
            skillsLearned: ['React', 'Node.js'],
            internship: 'int123',
            createdAt: '2023-10-31T00:00:00.000Z'
          }
        ])
      });
    });

    // Start waiting for the response before navigating
    const responsePromise = page.waitForResponse(/\/api\/my-internships\/student\/.*/);
    await page.goto('/dashboard?tab=myInternships');
    await responsePromise;
    
    // Wait for the internship list to load and the button to be visible
    const openDashboardBtn = page.getByRole('button', { name: 'Open Dashboard' });
    await expect(openDashboardBtn).toBeVisible({ timeout: 15000 });
    await openDashboardBtn.click();

    // Wait for the Monthly Report tab button and click it
    const monthlyReportTab = page.getByRole('button', { name: 'Monthly Report' });
    await expect(monthlyReportTab).toBeVisible({ timeout: 10000 });
    await monthlyReportTab.click();
  });

  test('should display existing monthly reports', async ({ page }) => {
    await expect(page.locator('h3:has-text("Monthly Reports")')).toBeVisible();
    await expect(page.locator('h4:has-text("October 2023")')).toBeVisible();
    await expect(page.locator('text=React')).toBeVisible();
    await expect(page.locator('text=Node.js')).toBeVisible();
  });

  test('should add a new monthly report', async ({ page }) => {
    await page.route('**/api/monthly-reports', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            _id: 'report2',
            month: 'November 2023',
            weekSummary: {
              week01: 'Started X',
              week02: 'Finished Y',
              week03: '',
              week04: ''
            },
            skillsLearned: ['Playwright'],
            internship: 'int123',
            createdAt: new Date().toISOString()
          })
        });
      }
    });

    await page.click('[data-testid="add-report-button"]');
    await page.selectOption('[data-testid="month-select"]', 'November');
    await page.selectOption('[data-testid="year-select"]', '2023');
    
    await page.fill('[data-testid="week-summary-week01"]', 'Started X');
    await page.fill('[data-testid="week-summary-week02"]', 'Finished Y');
    await page.fill('[data-testid="skills-learned-input"]', 'Playwright');
    
    await page.click('[data-testid="submit-report-button"]');

    await expect(page.locator('text=Report Saved!')).toBeVisible();
    await page.click('button:has-text("OK")');

    await expect(page.locator('h4:has-text("November 2023")')).toBeVisible();
    await expect(page.locator('text=Playwright')).toBeVisible();
  });

  test('should edit an existing monthly report', async ({ page }) => {
    await page.route('**/api/monthly-reports/report1', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            _id: 'report1',
            month: 'October 2023',
            weekSummary: {
              week01: 'Updated Summary',
              week02: 'Did B',
              week03: 'Did C',
              week04: 'Did D'
            },
            skillsLearned: ['React', 'Node.js', 'Testing'],
            internship: 'int123',
            createdAt: '2023-10-31T00:00:00.000Z'
          })
        });
      }
    });

    await page.click('[data-testid="edit-report-report1"]');
    await page.fill('[data-testid="week-summary-week01"]', 'Updated Summary');
    await page.fill('[data-testid="skills-learned-input"]', 'React, Node.js, Testing');
    
    await page.click('[data-testid="submit-report-button"]');

    await expect(page.locator('text=Report Updated!')).toBeVisible();
    await page.click('button:has-text("OK")');

    await expect(page.locator('text=Updated Summary')).toBeVisible();
    await expect(page.locator('text=Testing')).toBeVisible();
  });

  test('should delete a monthly report', async ({ page }) => {
    await page.route('**/api/monthly-reports/report1', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ 
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Deleted' })
        });
      }
    });

    await page.click('[data-testid="delete-report-report1"]');
    await page.click('button:has-text("Yes, delete")');

    await expect(page.locator('text=Deleted!')).toBeVisible();
    await page.click('button:has-text("OK")');
    await expect(page.locator('h4:has-text("October 2023")')).not.toBeVisible();
  });

  test('should search for a report', async ({ page }) => {
    const searchInput = page.locator('[data-testid="report-search-input"]');
    await searchInput.fill('October');
    await expect(page.locator('h4:has-text("October 2023")')).toBeVisible();

    await searchInput.fill('Nonexistent');
    await expect(page.locator('text=No reports found')).toBeVisible();
  });

  test('should show validation error if month is not selected', async ({ page }) => {
    await page.click('[data-testid="add-report-button"]');
    await page.click('[data-testid="submit-report-button"]');
    await expect(page.locator('text=Please select a month.')).toBeVisible();
  });
});
