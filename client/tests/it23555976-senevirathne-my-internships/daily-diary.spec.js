import { test, expect } from '@playwright/test';

test.describe('Daily Diary Feature', () => {
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
            duration: 6
          }
        ])
      });
    });

    // Mock diary entries
    await page.route('**/api/diary/internship/int123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: 'entry1',
            date: '2023-10-01T00:00:00.000Z',
            title: 'Initial Entry',
            description: 'Did some work',
            startTime: '09:00',
            endTime: '17:00',
            workingHours: 8,
            internship: 'int123'
          }
        ])
      });
    });

    await page.goto('/dashboard?tab=myInternships');
    await page.click('text=Open Dashboard');
    await page.click('button:has-text("Daily Diary")');
  });

  test('should display existing diary entries', async ({ page }) => {
    await expect(page.locator('h3:has-text("Daily Diary")')).toBeVisible();
    // Use more specific locator for the entry title
    await expect(page.locator('span:has-text("Initial Entry")')).toBeVisible();
    // Use more specific locator for the entry hours badge
    await expect(page.locator('span:has-text("8.0h")')).toBeVisible();
  });

  test('should add a new diary entry', async ({ page }) => {
    await page.route('**/api/diary', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            _id: 'entry2',
            date: '2023-10-02T00:00:00.000Z',
            title: 'New Task',
            description: 'New Description',
            startTime: '10:00',
            endTime: '12:00',
            workingHours: 2,
            internship: 'int123'
          })
        });
      }
    });

    await page.click('text=+ Add Entry');
    await page.fill('input[name="date"]', '2023-10-02');
    await page.fill('input[name="title"]', 'New Task');
    await page.fill('input[name="startTime"]', '10:00');
    await page.fill('input[name="endTime"]', '12:00');
    await page.fill('textarea[name="description"]', 'New Description');
    
    await page.click('button[type="submit"]:has-text("Save")');

    await expect(page.locator('text=Entry Added!')).toBeVisible();
    await page.click('button:has-text("OK")');

    // Verify entry in list using specific span locator to avoid confusion with Swal message
    await expect(page.locator('span:has-text("New Task")')).toBeVisible();
    await expect(page.locator('span:has-text("2.0h")')).toBeVisible();
  });

  test('should search for an entry', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by title or description...');
    await searchInput.fill('Initial');
    await expect(page.locator('span:has-text("Initial Entry")')).toBeVisible();

    await searchInput.fill('Nonexistent');
    await expect(page.locator('text=No entries found')).toBeVisible();
  });

  test('should edit an existing entry', async ({ page }) => {
    await page.route('**/api/diary/entry1', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            _id: 'entry1',
            date: '2023-10-01T00:00:00.000Z',
            title: 'Updated Entry',
            description: 'Updated Description',
            startTime: '09:00',
            endTime: '17:00',
            workingHours: 8,
            internship: 'int123'
          })
        });
      }
    });

    await page.click('button:has-text("✏️")');
    await page.fill('input[name="title"]', 'Updated Entry');
    await page.click('button[type="submit"]:has-text("Update")');

    await expect(page.locator('text=Entry Updated!')).toBeVisible();
    await page.click('button:has-text("OK")');
    await expect(page.locator('span:has-text("Updated Entry")')).toBeVisible();
  });

  test('should delete an entry', async ({ page }) => {
    await page.route('**/api/diary/entry1', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ 
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Deleted' })
        });
      }
    });

    await page.click('button:has-text("🗑️")');
    await page.click('button:has-text("Yes, delete")');

    await expect(page.locator('text=Deleted!')).toBeVisible();
    await page.click('button:has-text("OK")');
    await expect(page.locator('span:has-text("Initial Entry")')).not.toBeVisible();
  });
});
