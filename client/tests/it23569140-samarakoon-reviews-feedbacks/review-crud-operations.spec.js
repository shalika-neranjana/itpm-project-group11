import { test, expect } from '@playwright/test'

test.describe('Review CRUD Operations', () => {
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

  test('should successfully navigate to write review page', async ({ page }) => {
    await page.goto('/dashboard?tab=reviews')
    await page.getByRole('button', { name: 'Write Review' }).click()
    await expect(page).toHaveURL(/.*write-review/)
    await expect(page.getByRole('heading', { name: 'Write Anonymous Review' })).toBeVisible()
  })







  test('should navigate back when cancel is clicked', async ({ page }) => {
    await page.goto('/write-review')
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page).toHaveURL(/.*dashboard\?tab=reviews/)
  })
})
