import { test, expect } from '@playwright/test'

test.describe.skip('Review Comments Interactions', () => {
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

    // Mock review details to prevent page crash
    await page.route('**/api/reviews/rev-1', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { _id: 'rev-1', companyName: 'Test Co', authorId: 'student-2' }
        })
      })
    })
  })

  test('should load and display comments for a review', async ({ page }) => {
    await page.route('**/api/reviews/rev-1/comments*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { _id: 'c1', text: 'Great review!', authorName: 'Alice', createdAt: new Date().toISOString() },
            { _id: 'c2', text: 'I agree', authorName: 'Bob', createdAt: new Date().toISOString() }
          ]
        })
      })
    })

    await page.goto('/review/rev-1')

    await expect(page.getByText('Great review!').first()).toBeVisible()
    await expect(page.getByText('Alice').first()).toBeVisible()
    await expect(page.getByText('I agree').first()).toBeVisible()
    await expect(page.getByText('Bob').first()).toBeVisible()
  })

  test('should add a new comment to a review', async ({ page }) => {
    await page.route('**/api/reviews/rev-1/comments*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] })
        })
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { _id: 'c3', text: 'My new question', authorName: 'Gayantha', createdAt: new Date().toISOString() }
          })
        })
      }
    })

    await page.goto('/review/rev-1')

    await page.fill('textarea[placeholder="Start a new discussion point, question, or feedback..."]', 'My new question')
    await page.getByRole('button', { name: 'Post to Forum' }).click()

    await expect(page.getByText('My new question').first()).toBeVisible()
    await expect(page.getByText('Gayantha').first()).toBeVisible()
  })

  test('should edit a comment authored by the user', async ({ page }) => {
    await page.route('**/api/reviews/rev-1/comments*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { _id: 'c1', text: 'Old text', authorId: 'student-1', authorName: 'Gayantha', createdAt: new Date().toISOString() }
            ]
          })
        })
      }
    })

    await page.route('**/api/reviews/rev-1/comments/c1', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { _id: 'c1', text: 'Updated text', authorId: 'student-1', authorName: 'Gayantha' }
          })
        })
      }
    })

    await page.goto('/review/rev-1')

    await expect(page.getByText('Old text').first()).toBeVisible()
    await page.getByRole('button', { name: 'Edit' }).click()
    
    // It becomes a textarea
    const textarea = page.locator('textarea').filter({ hasText: 'Old text' })
    await textarea.fill('Updated text')
    
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Updated text').first()).toBeVisible()
  })

  test('should delete a comment authored by the user', async ({ page }) => {
    await page.route('**/api/reviews/rev-1/comments*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { _id: 'c1', text: 'To be deleted', authorId: 'student-1', authorName: 'Gayantha', createdAt: new Date().toISOString() }
            ]
          })
        })
      }
    })

    await page.route('**/api/reviews/rev-1/comments/c1', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        })
      }
    })

    await page.goto('/review/rev-1')

    page.on('dialog', dialog => dialog.accept())

    await expect(page.getByText('To be deleted').first()).toBeVisible()
    await page.getByRole('button', { name: 'Delete' }).click()
    
    await expect(page.getByText('To be deleted').first()).not.toBeVisible()
  })

  test('should reply to an existing comment', async ({ page }) => {
    await page.route('**/api/reviews/rev-1/comments*', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { _id: 'c1', text: 'A comment', authorName: 'Alice', createdAt: new Date().toISOString(), replies: [] }
            ]
          })
        })
      }
    })

    await page.route('**/api/reviews/rev-1/comments/c1/reply', async (route) => {
    if (route.request().url().includes('/src/')) { return route.continue(); }
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { 
              _id: 'c1', 
              text: 'A comment', 
              authorName: 'Alice', 
              replies: [
                { _id: 'r1', text: 'My reply', authorName: 'Gayantha' }
              ] 
            }
          })
        })
      }
    })

    await page.goto('/review/rev-1')

    await page.getByRole('button', { name: 'Reply' }).click()
    await page.fill('input[placeholder="Write your reply..."]', 'My reply')
    
    // Find the send button inside the reply div (it has the Send icon)
    // The closest generic locator is to find the button disabled:false inside the reply area.
    await page.locator('input[placeholder="Write your reply..."] + button').click()

    await expect(page.getByText('My reply').first()).toBeVisible()
  })
})
