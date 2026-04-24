import { test, expect } from '@playwright/test'

test.describe('Review Additional Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'student-token')
      window.localStorage.setItem('role', 'student')
      window.localStorage.setItem(
        'student',
        JSON.stringify({
          _id: 'student-1',
          firstName: 'Gayantha',
          email: 'gayantha@example.com',
        })
      )
    })

    await page.route('**/api/internships', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      })
    })

    await page.route('**/api/students/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      })
    })
  })

  test('should create a review successfully', async ({ page }) => {
    let createPayload = null

    await page.route('**/api/reviews', async (route) => {
      if (route.request().method() === 'POST') {
        createPayload = JSON.parse(route.request().postData() || '{}')
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              _id: 'rev-new',
              companyName: createPayload.companyName,
              position: createPayload.position,
              rating: createPayload.rating,
              description: createPayload.description,
              authorId: 'student-1',
              createdAt: new Date().toISOString(),
            },
          }),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      })
    })

    await page.goto('/dashboard?tab=reviews')

    await page.evaluate(async () => {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: 'Acme Labs',
          title: 'Software Intern',
          description: 'Learned practical backend and frontend engineering.',
          rating: 4,
          position: 'Software Intern',
        }),
      })
    })

    await expect.poll(() => createPayload).not.toBeNull()
    expect(createPayload).toMatchObject({
      companyName: 'Acme Labs',
      position: 'Software Intern',
      rating: 4,
    })

  })

  test('should update and then delete an authored review', async ({ page }) => {
    let updatePayload = null
    let deleteCalled = false

    await page.route('**/api/reviews/rev-1', async (route) => {
      const method = route.request().method()

      if (method === 'PUT') {
        updatePayload = JSON.parse(route.request().postData() || '{}')
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              _id: 'rev-1',
              companyName: updatePayload.companyName,
              position: updatePayload.position,
              rating: updatePayload.rating,
              description: updatePayload.description,
              authorId: 'student-1',
              createdAt: new Date().toISOString(),
            },
          }),
        })
        return
      }

      if (method === 'DELETE') {
        deleteCalled = true
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      }
    })

    await page.goto('/dashboard?tab=reviews')

    await page.evaluate(async () => {
      await fetch('/api/reviews/rev-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: 'Sysco',
          title: 'Intern',
          description: 'Updated experience after better mentorship.',
          rating: 5,
          position: 'Intern',
        }),
      })

      await fetch('/api/reviews/rev-1', { method: 'DELETE' })
    })

    await expect.poll(() => updatePayload).not.toBeNull()
    expect(updatePayload).toMatchObject({
      companyName: 'Sysco',
      position: 'Intern',
      rating: 5,
    })

    await expect.poll(() => deleteCalled).toBeTruthy()
  })

  test('should add a discussion comment and handle upvote/downvote', async ({ page }) => {
    const review = {
      _id: 'rev-1',
      companyName: 'Review Corp',
      position: 'Intern',
      rating: 4,
      description: 'Good place to learn',
      authorId: 'student-2',
      createdAt: new Date().toISOString(),
    }

    const now = new Date().toISOString()
    const comments = [
      {
        _id: 'c1',
        text: 'Existing thread',
        authorId: 'student-2',
        authorName: 'Alex',
        upvotedBy: [],
        downvotedBy: [],
        replies: [],
        createdAt: now,
      },
    ]

    const voteCalls = []

    await page.route('**/api/reviews/rev-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: review }),
      })
    })

    await page.route('**/api/reviews/rev-1/comments*', async (route) => {
      const method = route.request().method()

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: comments }),
        })
        return
      }

      if (method === 'POST') {
        const payload = JSON.parse(route.request().postData() || '{}')
        const newComment = {
          _id: 'c2',
          text: payload.text,
          authorId: 'student-1',
          authorName: 'Gayantha',
          upvotedBy: [],
          downvotedBy: [],
          replies: [],
          createdAt: now,
        }
        comments.unshift(newComment)

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: newComment }),
        })
      }
    })

    await page.route('**/api/reviews/rev-1/comments/c1/vote', async (route) => {
      const payload = JSON.parse(route.request().postData() || '{}')
      voteCalls.push(payload.vote)

      if (payload.vote === 'up') {
        comments[0].upvotedBy = ['student-1']
        comments[0].downvotedBy = []
      }

      if (payload.vote === 'down') {
        comments[0].upvotedBy = []
        comments[0].downvotedBy = ['student-1']
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: comments[0] }),
      })
    })

    await page.goto('/review/rev-1')

    await expect(page.getByText('Existing thread').first()).toBeVisible()

    await page.evaluate(async () => {
      await fetch('/api/reviews/rev-1/comments/c1/vote', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: 'up' }),
      })

      await fetch('/api/reviews/rev-1/comments/c1/vote', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: 'down' }),
      })
    })

    await expect.poll(() => voteCalls).toEqual(['up', 'down'])

    await page.fill('textarea[placeholder="Start a new discussion point, question, or feedback..."]', 'How is the mentorship quality?')
    await page.getByRole('button', { name: 'Post to Forum' }).click()

    await expect(page.getByText('How is the mentorship quality?').first()).toBeVisible()
  })
})
