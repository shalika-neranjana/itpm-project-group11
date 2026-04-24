import { test, expect } from '@playwright/test'

const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9l9J4AAAAASUVORK5CYII=',
  'base64'
)

async function uploadLogoAndConfirmCrop(page) {
  // Use locator for the file input which might be hidden but handles files
  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'company-logo.png',
    mimeType: 'image/png',
    buffer: tinyPng
  })
  await expect(page.getByText('Crop image to square (1:1)')).toBeVisible()
  await page.getByRole('button', { name: 'Use Cropped Image' }).click()
}

test.describe('Company Registration & Account Management', () => {
  test('registration should validate required company fields', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('button', { name: 'Company' }).click()
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Use specific locators to avoid strict mode violations (since error shows both in list and under field)
    await expect(page.locator('#name-error')).toHaveText('Company name is required.')
    await expect(page.locator('#industry-error')).toHaveText('Industry is required.')
    await expect(page.locator('#address-error')).toHaveText('Address is required.')
    await expect(page.locator('#website-error')).toHaveText('Website is required.')
    // Note: phoneCompany in component creates an error for 'phoneCompany-error' if name is 'phoneCompany'
    // but the error state field might just be 'phoneCompany'. Let's check the text using first() to be safe.
    await expect(page.getByText('Phone number is required.').first()).toBeVisible()
    await expect(page.getByText('Company logo is required.').first()).toBeVisible()
    await expect(page.locator('#email-error')).toHaveText('Email is required.')
    await expect(page.locator('#password-error')).toHaveText('Password is required.')
    await expect(page.locator('#confirmPassword-error')).toHaveText('Please confirm your password.')
  })

  test('registration should enforce password validation rules', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('button', { name: 'Company' }).click()

    await page.fill('input[name="name"]', 'Seylan Bank PLC')
    await page.selectOption('select[name="industry"]', 'Finance & Business Services')
    await page.fill('input[name="address"]', 'No. 90, Galle Road, Colombo')
    await page.fill('input[name="website"]', 'https://www.seylan.lk')
    await page.fill('input[name="phoneCompany"]', '+94771234567')
    await page.fill('input[name="email"]', 'qa-company@seylan.lk')
    await page.fill('input[name="password"]', 'weakpass')
    await page.fill('input[name="confirmPassword"]', 'weakpass')

    await uploadLogoAndConfirmCrop(page)
    await page.getByRole('button', { name: 'Create Account' }).click()

    await expect(
      page.getByText('Password must include uppercase, lowercase, number, special character, and be at least 8 characters.').first()
    ).toBeVisible()
  })

  test('registration should validate email uniqueness and phone uniqueness', async ({ page }) => {
    let duplicateMode = 'email'

    await page.route('**/api/company/register', async (route) => {
      if (route.request().method() !== 'POST') {
        return route.continue()
      }

      const message =
        duplicateMode === 'email'
          ? 'Email already exists'
          : 'Phone number already exists'

      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message })
      })
    })

    await page.goto('/register')
    await page.getByRole('button', { name: 'Company' }).click()

    await page.fill('input[name="name"]', 'Seylan Bank PLC')
    await page.selectOption('select[name="industry"]', 'Finance & Business Services')
    await page.fill('input[name="address"]', 'No. 90, Galle Road, Colombo')
    await page.fill('input[name="website"]', 'https://www.seylan.lk')
    await page.fill('input[name="phoneCompany"]', '+94771234567')
    await page.fill('input[name="email"]', 'info@seylan.lk')
    await page.fill('input[name="password"]', 'Seylanbank@123#')
    await page.fill('input[name="confirmPassword"]', 'Seylanbank@123#')
    await uploadLogoAndConfirmCrop(page)

    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page.getByText('Email already exists').first()).toBeVisible()

    duplicateMode = 'phone'
    await page.fill('input[name="email"]', 'new-company@seylan.lk')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page.getByText('Phone number already exists').first()).toBeVisible()
  })

  test('login should validate email and password inputs', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.locator('#email-error')).toHaveText('Email is required.')
    await expect(page.locator('#password-error')).toHaveText('Password is required.')

    await page.fill('input[name="email"]', 'invalid-email')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.locator('#email-error')).toHaveText('Enter a valid email address.')
  })

  test('company profile management should edit and update profile details', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'company-token')
      window.localStorage.setItem('role', 'company')
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          name: 'Seylan Bank PLC',
          industry: 'Finance & Business Services',
          address: 'Colombo',
          website: 'https://www.seylan.lk',
          phone: '+94112345678',
          email: 'info@seylan.lk'
        })
      )
    })

    await page.route('**/api/company/profile', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              name: 'Seylan Bank PLC',
              industry: 'Finance & Business Services',
              address: 'Colombo',
              website: 'https://www.seylan.lk',
              phone: '+94112345678',
              email: 'info@seylan.lk'
            }
          })
        })
      } else if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              name: 'Seylan Bank PLC Updated',
              industry: 'Finance & Business Services',
              address: 'Colombo',
              website: 'https://www.seylan.lk',
              phone: '+94112345678',
              email: 'info@seylan.lk'
            }
          })
        })
      }
    })

    await page.route('**/api/internships/company/my', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      })
    })

    await page.goto('/company-dashboard')
    await page.getByRole('button', { name: 'Company Profile' }).click()
    await page.getByRole('button', { name: 'Edit Profile' }).click()

    await page.fill('input[name="name"]', 'Seylan Bank PLC Updated')
    await page.getByRole('button', { name: 'Save Changes' }).click()

    await expect(page.getByText('Company profile updated successfully').first()).toBeVisible()
    await expect(page.locator('h2', { hasText: 'Seylan Bank PLC Updated' }).first()).toBeVisible()
  })
})
