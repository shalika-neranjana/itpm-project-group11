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

  test.skip('should upvote a comment', async ({ page }) => {
    await page.route('**/api/reviews/rev-1', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { _id: 'rev-1', companyName: 'Test' } }) })
    })

    await page.route('**/api/reviews/rev-1/comments*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { _id: 'c1', text: 'Good point', upvotedBy: [], downvotedBy: [] }
            ]
          })
        })
      }
    })

    await page.route('**/api/reviews/rev-1/comments/c1/vote', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { _id: 'c1', text: 'Good point', upvotedBy: ['student-1'], downvotedBy: [] }
          })
        })
      }
    })

    await page.goto('/review/rev-1')

    // Find the upvote button for the comment. Initial count is 0.
    const upvoteBtn = page.locator('button').filter({ hasText: /^0$/ }).first() // The upvote is the first one
    await upvoteBtn.click()

    // The count should update to 1 (from the mocked response)
    await expect(page.locator('button').filter({ hasText: /^1$/ })).toBeVisible()
  })

  test.skip('should downvote a comment', async ({ page }) => {
    await page.route('**/api/reviews/rev-1', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { _id: 'rev-1', companyName: 'Test' } }) })
    })

    await page.route('**/api/reviews/rev-1/comments*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { _id: 'c1', text: 'Bad point', upvotedBy: [], downvotedBy: [] }
            ]
          })
        })
      }
    })

    await page.route('**/api/reviews/rev-1/comments/c1/vote', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { _id: 'c1', text: 'Bad point', upvotedBy: [], downvotedBy: ['student-1'] }
          })
        })
      }
    })

    await page.goto('/review/rev-1')

    // Find the downvote button for the comment.
    const downvoteBtn = page.locator('button').filter({ hasText: /^0$/ }).nth(1) // The downvote is the second one
    await downvoteBtn.click()

    await expect(page.locator('button').filter({ hasText: /^1$/ })).toBeVisible()
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

  test.skip('should mark review as unhelpful in forum', async ({ page }) => {
    await page.route('**/api/reviews*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { _id: 'rev-1', companyName: 'Test', position: 'Test', description: 'Test', unhelpful: 5 }
            ]
          })
        })
      }
    })

    await page.route('**/api/reviews/rev-1/unhelpful', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { _id: 'rev-1', companyName: 'Test', position: 'Test', description: 'Test', unhelpful: 6 }
          })
        })
      }
    })

    await page.goto('/dashboard?tab=reviews')

    await expect(page.getByText('Test', { exact: true }).first()).toBeVisible()

    // Assuming the "Unhelpful (5)" button exists in ThreadCard
    const unhelpfulBtn = page.getByRole('button', { name: /Unhelpful/ })
    await unhelpfulBtn.click()

    await expect(page.getByText('Marked as unhelpful').first()).toBeVisible()
  })
})
