import { test, expect } from '@playwright/test'

test.describe('Review Details', () => {
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
  })





  test('should show edit and delete buttons for review author', async ({ page }) => {
    await page.route('**/api/reviews/rev-1', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { 
            _id: 'rev-1', 
            companyName: 'My Company', 
            position: 'Intern', 
            rating: 4, 
            description: 'Good', 
            authorId: 'student-1', // Matches logged in user
            createdAt: new Date().toISOString()
          }
        })
      })
    })

    await page.route('**/api/reviews/rev-1/comments*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
    })

    await page.goto('/review/rev-1')

    await expect(page.getByRole('button', { name: 'Edit Review' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Delete Review' })).toBeVisible()
  })

  test('should not show edit and delete buttons for non-author', async ({ page }) => {
    await page.route('**/api/reviews/rev-1', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { 
            _id: 'rev-1', 
            companyName: 'Other Company', 
            position: 'Intern', 
            rating: 4, 
            description: 'Good', 
            authorId: 'student-2', // Different user
            createdAt: new Date().toISOString()
          }
        })
      })
    })

    await page.route('**/api/reviews/rev-1/comments*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
    })

    await page.goto('/review/rev-1')

    await expect(page.getByRole('button', { name: 'Edit Review' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Delete Review' })).not.toBeVisible()
  })

  test('should delete review when delete button is clicked and confirmed', async ({ page }) => {
    await page.route('**/api/reviews/rev-1', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { _id: 'rev-1', companyName: 'My Company', position: 'Intern', rating: 4, authorId: 'student-1' }
          })
        })
      } else if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        })
      }
    })

    await page.route('**/api/reviews/rev-1/comments*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
    })

    await page.goto('/review/rev-1')

    // Accept window.confirm
    page.on('dialog', dialog => dialog.accept())

    await page.getByRole('button', { name: 'Delete Review' }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard\?tab=reviews/)
  })
})
