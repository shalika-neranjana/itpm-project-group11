import { test, expect } from '@playwright/test'

test.describe('Application Review (Company)', () => {
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

  test('should view all applicants', async ({ page }) => {
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
          data: [
            {
              _id: 'int-123',
              title: 'Software Engineer Intern',
              type: 'On-site',
              location: 'Colombo',
              applications: [
                {
                  _id: 'app-1',
                  name: 'Gayantha Perera',
                  email: 'gayantha@outlook.com',
                  status: 'Pending',
                  coverLetter: 'I am a great fit.'
                }
              ]
            }
          ]
        })
      })
    })

    await page.goto('/company-dashboard')
    await page.getByRole('button', { name: 'Applicants' }).click()

    await expect(page.getByText('Gayantha Perera')).toBeVisible()
    await expect(page.getByText('Pending').last()).toBeVisible()
    await expect(page.getByText('I am a great fit.')).toBeVisible()
  })

  test('should accept applications and trigger email notifications (simulated)', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()))
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText))

    await page.route('**/api/company/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { name: 'Seylan Bank PLC' } })
      })
    })

    let currentStatus = 'Pending'
    await page.route('**/api/internships/company/my', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: 'int-123',
              title: 'Software Engineer Intern',
              type: 'On-site',
              location: 'Colombo',
              applications: [
                {
                  _id: 'app-1',
                  name: 'Gayantha Perera',
                  email: 'gayantha@outlook.com',
                  status: currentStatus,
                  coverLetter: 'I am a great fit.'
                }
              ]
            }
          ]
        })
      })
    })

    await page.route('**/api/internships/int-123/applications/app-1', async (route) => {
      if (route.request().method() === 'PUT') {
        currentStatus = 'Accepted'
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Application updated' })
      })
    })

    await page.goto('/company-dashboard')
    await page.getByRole('button', { name: 'Applicants' }).click()

    // Accept
    await page.getByRole('button', { name: 'Accept' }).first().click()

    await expect(page.locator('.swal2-html-container')).toContainText('Application accepted')
    await page.getByRole('button', { name: 'OK' }).click()
    
    // Status is now Accepted due to fetchCompanyInternships re-run
    // Status is now Accepted due to fetchCompanyInternships re-run. 
    // We use .last() because the first one might be the hidden option in the select.
    await expect(page.getByText('Accepted').last()).toBeVisible()
  })

  test('should reject applications and trigger email notifications (simulated)', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()))
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText))

    await page.route('**/api/company/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { name: 'Seylan Bank PLC' } })
      })
    })

    let currentStatus = 'Pending'
    await page.route('**/api/internships/company/my', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: 'int-123',
              title: 'Software Engineer Intern',
              type: 'On-site',
              location: 'Colombo',
              applications: [
                {
                  _id: 'app-1',
                  name: 'Gayantha Perera',
                  email: 'gayantha@outlook.com',
                  status: currentStatus,
                  coverLetter: 'I am a great fit.'
                }
              ]
            }
          ]
        })
      })
    })

    await page.route('**/api/internships/int-123/applications/app-1', async (route) => {
      if (route.request().method() === 'PUT') {
        currentStatus = 'Rejected'
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Application updated' })
      })
    })

    await page.goto('/company-dashboard')
    await page.getByRole('button', { name: 'Applicants' }).click()

    // Reject
    await page.getByRole('button', { name: 'Reject' }).first().click()

    await expect(page.locator('.swal2-html-container')).toContainText('Application rejected')
    await page.getByRole('button', { name: 'OK' }).click()
    
    // Status is now Rejected due to fetchCompanyInternships re-run
    // Status is now Rejected due to fetchCompanyInternships re-run
    // We use .last() because the first one might be the hidden option in the select.
    await expect(page.getByText('Rejected').last()).toBeVisible()
  })
})
