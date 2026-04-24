import { test, expect } from '@playwright/test';

test.describe('Final Report Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('student', JSON.stringify({
        studentId: 'ST123',
        firstName: 'Test',
        lastName: 'Student'
      }));
    });

    // Mock internship
    await page.route('**/api/my-internships/student/ST123', async route => {
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
            supervisorEmail: 'supervisor@test.com',
            supervisorName: 'Supervisor Name'
          }
        ])
      });
    });
  });

  async function navigateToFinalReport(page, reportData = null) {
    // Mock final report response
    await page.route('**/api/final-reports/internship/int123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(reportData)
      });
    });

    await page.goto('/dashboard?tab=myInternships');
    await page.click('text=Open Dashboard');
    await page.click('button:has-text("Final Report")');
  }

  test('should display empty state and open form when "Create" is clicked', async ({ page }) => {
    await navigateToFinalReport(page, null);
    
    await expect(page.locator('text=No final report yet')).toBeVisible();
    await page.click('[data-testid="final-report-create-button"]');
    
    await expect(page.locator('[data-testid="final-report-executive-summary"]')).toBeVisible();
  });

  test('should create and save a final report as draft', async ({ page }) => {
    await navigateToFinalReport(page, null);
    await page.click('[data-testid="final-report-create-button"]');

    await page.route('**/api/final-reports', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            _id: 'rep123',
            internship: 'int123',
            executiveSummary: 'This was a great internship.',
            keyAccomplishments: ['Learned Playwright'],
            skillsAcquired: ['Testing'],
            conclusionRecommendations: 'Highly recommended.',
            status: 'draft'
          })
        });
      }
    });

    await page.fill('[data-testid="final-report-executive-summary"]', 'This was a great internship.');
    await page.fill('[data-testid="final-report-key-accomplishments"]', 'Learned Playwright');
    await page.fill('[data-testid="final-report-skills-acquired"]', 'Testing');
    await page.fill('[data-testid="final-report-conclusion"]', 'Highly recommended.');
    
    await page.click('[data-testid="final-report-save-draft"]');

    await expect(page.locator('text=Draft Saved!')).toBeVisible();
    await page.click('button:has-text("OK")');

    await expect(page.locator('text=📝 Draft')).toBeVisible();
    await expect(page.locator('text=This was a great internship.')).toBeVisible();
  });

  test('should edit an existing final report', async ({ page }) => {
    const existingReport = {
      _id: 'rep123',
      internship: 'int123',
      executiveSummary: 'Initial summary',
      status: 'draft'
    };
    
    await navigateToFinalReport(page, existingReport);

    await page.click('[data-testid="final-report-edit"]');
    await page.fill('[data-testid="final-report-executive-summary"]', 'Updated summary');
    
    await page.route('**/api/final-reports/rep123', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...existingReport,
            executiveSummary: 'Updated summary'
          })
        });
      }
    });

    await page.click('[data-testid="final-report-save-draft"]');
    await expect(page.locator('text=Draft Saved!')).toBeVisible();
    await page.click('button:has-text("OK")');
    
    await expect(page.locator('text=Updated summary')).toBeVisible();
  });

  test('should submit a final report', async ({ page }) => {
    const existingReport = {
      _id: 'rep123',
      internship: 'int123',
      executiveSummary: 'Ready to submit',
      status: 'draft'
    };
    
    await navigateToFinalReport(page, existingReport);
    await page.click('[data-testid="final-report-edit"]');

    await page.route('**/api/final-reports/rep123', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...existingReport,
            status: 'submitted'
          })
        });
      }
    });

    await page.click('[data-testid="final-report-submit"]');
    await page.click('button:has-text("Yes, submit")');

    await expect(page.locator('text=Report Submitted! 🎉')).toBeVisible();
    await page.click('button:has-text("OK")');
    
    await expect(page.locator('text=✅ Submitted')).toBeVisible();
  });

  test('should show and hide the email dialog', async ({ page }) => {
    await navigateToFinalReport(page, {
      _id: 'rep123',
      status: 'submitted'
    });

    await page.click('[data-testid="final-report-send-to-supervisor"]');
    await expect(page.locator('[data-testid="final-report-email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="final-report-email-input"]')).toHaveValue('supervisor@test.com');

    await page.click('[data-testid="final-report-email-cancel"]');
    await expect(page.locator('[data-testid="final-report-email-input"]')).not.toBeVisible();
  });

  test('should delete a final report', async ({ page }) => {
    await navigateToFinalReport(page, {
      _id: 'rep123',
      status: 'draft',
      executiveSummary: 'To be deleted'
    });

    await page.route('**/api/final-reports/rep123', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Deleted' })
        });
      }
    });

    await page.click('[data-testid="final-report-delete"]');
    await page.click('button:has-text("Yes, delete")');

    await expect(page.locator('text=Deleted!')).toBeVisible();
    await page.click('button:has-text("OK")');
    
    await expect(page.locator('text=No final report yet')).toBeVisible();
  });
});
