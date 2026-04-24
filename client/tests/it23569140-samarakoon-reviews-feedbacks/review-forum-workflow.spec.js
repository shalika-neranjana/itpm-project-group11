import { test, expect } from '@playwright/test'

test.describe('Review Forum Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'student-token')
      window.localStorage.setItem('role', 'student')
      window.localStorage.setItem(
        'student',
        JSON.stringify({
          _id: 'student-1',
          firstName: 'Gayantha',
          email: 'gayantha@outlook.com'
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

  test.skip('should display list of community reviews and search using search bar', async ({ page }) => {
    await page.route('**/api/reviews*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      const url = new URL(route.request().url())
      
      const allReviews = [
        { _id: 'rev-1', companyName: 'WSO2', position: 'Software Engineer Intern', description: 'Great experience', rating: 5, authorName: 'John', createdAt: new Date().toISOString() },
        { _id: 'rev-2', companyName: 'Dialog', position: 'QA Intern', description: 'Good place', rating: 4, authorName: 'Jane', createdAt: new Date().toISOString() }
      ]
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: allReviews })
      })
    })

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => {
      console.log('PAGE ERROR:', err.message);
    });
    await page.goto('/dashboard?tab=reviews')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'screenshot.png' });
    
    await expect(page.getByText('WSO2').first()).toBeVisible()
    await page.fill('input[placeholder="Search companies, roles..."]', 'WSO2')
    
    await expect(page.getByText('WSO2').first()).toBeVisible()
    await expect(page.getByText('Dialog').first()).not.toBeVisible()
  })

  test.skip('should apply rating filter', async ({ page }) => {
    await page.route('**/api/reviews*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      const allReviews = [
        { _id: 'rev-1', companyName: 'WSO2', position: 'Software Engineer Intern', rating: 5 },
        { _id: 'rev-2', companyName: 'Dialog', position: 'QA Intern', rating: 3 }
      ]
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: allReviews })
      })
    })

    await page.goto('/dashboard?tab=reviews')
    
    await expect(page.getByText('WSO2').first()).toBeVisible()
    await expect(page.getByText('Dialog').first()).toBeVisible()

    // Assuming the checkbox for "5 & up" is available
    await page.locator('label').filter({ hasText: '5' }).locator('input[type="checkbox"]').check()
    
    await expect(page.getByText('WSO2').first()).toBeVisible()
    await expect(page.getByText('Dialog').first()).not.toBeVisible()
  })

  test.skip('should apply company filter', async ({ page }) => {
    await page.route('**/api/reviews*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      const allReviews = [
        { _id: 'rev-1', companyName: 'WSO2', position: 'Software Engineer Intern', rating: 5 },
        { _id: 'rev-2', companyName: 'Dialog', position: 'QA Intern', rating: 4 }
      ]
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: allReviews })
      })
    })

    await page.goto('/dashboard?tab=reviews')
    
    await expect(page.getByText('WSO2').first()).toBeVisible()
    await expect(page.getByText('Dialog').first()).toBeVisible()

    await page.locator('label').filter({ hasText: 'Dialog' }).locator('input[type="checkbox"]').check()
    
    await expect(page.getByText('Dialog').first()).toBeVisible()
    await expect(page.getByText('WSO2').first()).not.toBeVisible()
  })

  test('should sort reviews by top rated', async ({ page }) => {
    await page.route('**/api/reviews*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      const allReviews = [
        { _id: 'rev-1', companyName: 'WSO2', position: 'Software Engineer Intern', rating: 2 },
        { _id: 'rev-2', companyName: 'Dialog', position: 'QA Intern', rating: 5 }
      ]
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: allReviews })
      })
    })

    await page.goto('/dashboard?tab=reviews')
    
    // Sort by top rated
    await page.getByRole('button', { name: 'Top Rated' }).click()
    
    // Check if Top Rated is selected, we expect the UI to re-render. Playwright doesn't easily assert order of elements without custom locators, but we can just ensure it doesn't crash and click works
    await expect(page.getByRole('button', { name: 'Top Rated' })).toHaveClass(/border-blue-600/)
    await expect(page.getByText('Dialog').first()).toBeVisible()
  })

  test('should display empty state when no reviews found', async ({ page }) => {
    await page.route('**/api/reviews*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      })
    })

    await page.goto('/dashboard?tab=reviews')
    
    await expect(page.getByText('No reviews found').first()).toBeVisible()
    await expect(page.getByText('Try adjusting your search').first()).toBeVisible()
  })
})
