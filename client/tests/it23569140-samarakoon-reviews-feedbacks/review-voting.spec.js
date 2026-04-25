import { test, expect } from '@playwright/test'

test.describe('Review Voting Options', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'student-token')
      window.localStorage.setItem('role', 'student')
      window.localStorage.setItem(
        'student',
        JSON.stringify({
          _id: 'student-1',
          firstName: 'Gayantha'
        })
      )
    })
    
    // Mock Dashboard background requests
    await page.route('**/api/internships', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
    })
    await page.route('**/api/students/notifications', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
    })
  })





  test('should mark review as helpful in forum', async ({ page }) => {
    await page.route('**/api/reviews*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { _id: 'rev-1', companyName: 'Test', position: 'Test', description: 'Test', helpful: 10 }
            ]
          })
        })
      }
    })

    await page.route('**/api/reviews/rev-1/helpful', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { _id: 'rev-1', companyName: 'Test', position: 'Test', description: 'Test', helpful: 11 }
          })
        })
      }
    })

    await page.goto('/dashboard?tab=reviews')

    // Ensure it's loaded
    await expect(page.getByText('Test', { exact: true }).first()).toBeVisible()

    // Assuming the "Helpful (10)" button exists in ThreadCard
    const helpfulBtn = page.getByRole('button', { name: /Helpful/ })
    await helpfulBtn.click()

    // Wait for the Toast notification
    await expect(page.getByText('Marked as helpful').first()).toBeVisible()
  })


})
