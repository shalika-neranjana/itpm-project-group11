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

  test.skip('should create a new review', async ({ page }) => {
    await page.route('**/api/reviews', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { _id: 'new-rev', companyName: 'Virtusa', position: 'SE', rating: 4, description: 'Great' }
          })
        })
      }
    })

    await page.goto('/write-review')

    await page.fill('input[name="company"]', 'Virtusa')
    await page.fill('input[name="role"]', 'SE')
    
    // Select rating 4
    await page.getByRole('button', { name: '★ 4' }).click()
    
    await page.fill('textarea[name="experience"]', 'Great internship experience.')
    
    await page.getByRole('button', { name: 'Submit Review' }).click()
    
    await expect(page.getByText('Review posted successfully').first()).toBeVisible()
  })

  test.skip('should validate required fields when creating review', async ({ page }) => {
    await page.goto('/write-review')

    // Click submit without filling anything
    await page.getByRole('button', { name: 'Submit Review' }).click()
    
    // Sweetalert should pop up or warning should be visible
    await expect(page.getByText('Please fill all').first()).toBeVisible()
  })

  test.skip('should edit an existing review', async ({ page }) => {
    // Navigate with state
    await page.goto('/') // go somewhere first
    await page.evaluate(() => {
      window.history.pushState(
        { 
          review: { _id: 'rev-1', company: 'Sysco', role: 'Intern', rating: 3, text: 'Okay experience' } 
        }, 
        '', 
        '/write-review'
      )
    })
    await page.goto('/write-review')

    // It should prefill
    await expect(page.locator('input[name="company"]')).toHaveValue('Sysco')
    
    await page.route('**/api/reviews/rev-1', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { _id: 'rev-1', companyName: 'Sysco', position: 'Intern', rating: 4, description: 'Much better' }
          })
        })
      }
    })

    await page.getByRole('button', { name: '★ 4' }).click()
    await page.getByRole('button', { name: 'Update Review' }).click()
    
    await expect(page.getByText('Review updated successfully').first()).toBeVisible()
  })

  test('should navigate back when cancel is clicked', async ({ page }) => {
    await page.goto('/write-review')
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page).toHaveURL(/.*dashboard\?tab=reviews/)
  })
})
