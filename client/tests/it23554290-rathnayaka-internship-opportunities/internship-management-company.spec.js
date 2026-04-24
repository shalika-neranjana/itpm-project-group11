import { test, expect } from '@playwright/test'

test.describe('Internship Management (Company)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'company-token')
      window.localStorage.setItem('role', 'company')
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          name: 'Seylan Bank PLC',
          email: 'info@seylan.lk'
        })
      )
    })
  })

  test('should create (post) a new internship', async ({ page }) => {
    await page.route('**/api/company/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { name: 'Seylan Bank PLC' } })
      })
    })

    await page.route('**/api/internships/company/my', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      })
    })

    await page.route('**/api/internships', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { _id: 'new-int', title: 'New QA Intern' } })
        })
      }
    })

    await page.goto('/company-dashboard')
    await page.getByRole('button', { name: '+ Post New Internship' }).click()

    await expect(page).toHaveURL(/\/company-dashboard\/post-internship/)
    await page.fill('input[placeholder="e.g. Software Engineering Intern"]', 'New QA Intern')
    await page.getByRole('button', { name: 'Post Internship' }).click()

    await expect(page).toHaveURL(/\/company-dashboard/)
  })

  test('should edit existing internship details', async ({ page }) => {
    await page.route('**/api/company/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { name: 'Seylan Bank PLC' } })
      })
    })

    await page.route('**/api/internships/company/my', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{ _id: 'int-123', title: 'Old QA Intern', specialization: 'Computer Science', type: 'On-site', duration: '6', slots: 2, applications: [] }]
        })
      })
    })

    await page.route('**/api/internships/int-123', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { _id: 'int-123', title: 'Old QA Intern', specialization: 'Computer Science', type: 'On-site', duration: '6', slots: 2 }
          })
        })
      } else if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { _id: 'int-123', title: 'Updated QA Intern' } })
        })
      }
    })

    await page.goto('/company-dashboard')
    await page.getByRole('button', { name: 'Edit' }).first().click()

    await expect(page).toHaveURL(/\/company-dashboard\/edit-internship\/int-123/)
    await page.fill('input[placeholder="e.g. Software Engineering Intern"]', 'Updated QA Intern')
    await page.getByRole('button', { name: 'Save Changes' }).click()

    await expect(page).toHaveURL(/\/company-dashboard/)
  })

  test('should delete published internships', async ({ page }) => {
    await page.route('**/api/company/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { name: 'Seylan Bank PLC' } })
      })
    })

    let deleted = false
    await page.route('**/api/internships/company/my', async (route) => {
      if (!deleted) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{ _id: 'int-123', title: 'To Delete Intern', specialization: 'Computer Science', type: 'On-site', applications: [] }]
          })
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] })
        })
      }
    })

    await page.route('**/api/internships/int-123', async (route) => {
      if (route.request().method() === 'DELETE') {
        deleted = true
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Deleted' })
        })
      }
    })

    await page.goto('/company-dashboard')
    await page.getByRole('button', { name: 'Delete' }).first().click()
    
    // In sweetalert2 confirm, the default confirm text is 'Yes'
    await page.getByRole('button', { name: 'Yes' }).click()
    
    await expect(page.getByText('Internship deleted successfully')).toBeVisible()
    await page.getByRole('button', { name: 'OK' }).click()
    await expect(page.getByText('To Delete Intern')).not.toBeVisible()
  })
})
