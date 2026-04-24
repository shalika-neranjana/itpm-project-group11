# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: it23569140-samarakoon-reviews-feedbacks\review-forum-filtering.spec.js >> Review Forum Filtering >> should filter reviews by company
- Location: tests\it23569140-samarakoon-reviews-feedbacks\review-forum-filtering.spec.js:69:3

# Error details

```
Error: locator.check: Page crashed
Call log:
  - waiting for getByLabel('WSO2')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | const baseReviews = () => [
  4  |   {
  5  |     _id: '1',
  6  |     company: 'WSO2',
  7  |     role: 'Software Engineer Intern',
  8  |     rating: 5,
  9  |     text: 'Excellent learning environment and great mentors.',
  10 |     authorName: 'Gayantha Perera',
  11 |     helpful: 10,
  12 |     unhelpful: 1,
  13 |     createdAt: new Date().toISOString()
  14 |   },
  15 |   {
  16 |     _id: '2',
  17 |     company: 'Sysco LABS',
  18 |     role: 'QA Intern',
  19 |     rating: 4,
  20 |     text: 'Good exposure to automation testing tools.',
  21 |     authorName: 'Anuki Silva',
  22 |     helpful: 5,
  23 |     unhelpful: 0,
  24 |     createdAt: new Date(Date.now() - 86400000).toISOString()
  25 |   }
  26 | ]
  27 | 
  28 | const seedStudentSession = async (page) => {
  29 |   await page.addInitScript(() => {
  30 |     window.localStorage.setItem('token', 'mock-student-token')
  31 |     window.localStorage.setItem('role', 'student')
  32 |     window.localStorage.setItem('student', JSON.stringify({
  33 |       _id: 'student-1',
  34 |       studentId: 'ST001',
  35 |       firstName: 'Gayantha',
  36 |       lastName: 'Perera'
  37 |     }))
  38 |   })
  39 | }
  40 | 
  41 | test.describe('Review Forum Filtering', () => {
  42 |   test.use({ viewport: { width: 1280, height: 720 } })
  43 | 
  44 |   test.beforeEach(async ({ page }) => {
  45 |     await seedStudentSession(page)
  46 |     
  47 |     await page.route('**', async (route) => {
  48 |       const url = route.request().url()
  49 |       const method = route.request().method()
  50 |       const type = route.request().resourceType()
  51 |       
  52 |       if (type === 'fetch' || type === 'xhr') {
  53 |         if (url.includes('/api/reviews') && method === 'GET' && !url.includes('/summarize')) {
  54 |           await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(baseReviews()) })
  55 |         } else if (url.includes('/api/')) {
  56 |           await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
  57 |         } else {
  58 |           await route.continue()
  59 |         }
  60 |       } else {
  61 |         await route.continue()
  62 |       }
  63 |     })
  64 | 
  65 |     await page.goto('/dashboard?tab=reviews')
  66 |     await page.waitForTimeout(1000)
  67 |   })
  68 | 
  69 |   test('should filter reviews by company', async ({ page }) => {
> 70 |     await page.getByLabel('WSO2').check()
     |                                   ^ Error: locator.check: Page crashed
  71 |     await expect(page.getByRole('heading', { name: 'WSO2' })).toBeVisible()
  72 |     await expect(page.getByRole('heading', { name: 'Sysco LABS' })).not.toBeVisible()
  73 |   })
  74 | 
  75 |   test('should filter reviews by rating', async ({ page }) => {
  76 |     await page.getByText('5 ★ & up').click()
  77 |     await expect(page.getByRole('heading', { name: 'WSO2' })).toBeVisible()
  78 |     await expect(page.getByRole('heading', { name: 'Sysco LABS' })).not.toBeVisible()
  79 |   })
  80 | 
  81 |   test('should combine multiple filters', async ({ page }) => {
  82 |     await page.getByLabel('Sysco LABS').check()
  83 |     await page.getByText('4 ★ & up').click()
  84 |     await expect(page.getByRole('heading', { name: 'Sysco LABS' })).toBeVisible()
  85 |     await expect(page.getByRole('heading', { name: 'WSO2' })).not.toBeVisible()
  86 |   })
  87 | })
  88 | 
```