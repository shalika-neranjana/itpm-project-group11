import { test, expect } from '@playwright/test'
import { setupGuidanceMocks } from './guidance-test-helpers'

test.describe('Student Guidance - Ask InternConnect', () => {
  test.beforeEach(async ({ page }) => {
    await setupGuidanceMocks(page)
    await page.goto('/dashboard?tab=guidance')
    await page.getByRole('button', { name: 'Ask InternConnect' }).click()
  })

  test('sends a custom user message', async ({ page }) => {
    await page.fill(
      'textarea[placeholder="Ask about profile improvements, internship readiness, or career direction..."]',
      'How can I improve my internship profile?'
    )
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page.getByText('How can I improve my internship profile?')).toBeVisible()
    await expect.poll(async () => page.locator('article').count()).toBeGreaterThan(2)
  })

  test('uses a quick prompt to send a message', async ({ page }) => {
    await page.getByRole('button', { name: 'How can I improve my internship profile?' }).click()

    await expect(page.getByText('How can I improve my internship profile?')).toBeVisible()
  })

  test('clears chat and resets message list', async ({ page }) => {
    await page.fill(
      'textarea[placeholder="Ask about profile improvements, internship readiness, or career direction..."]',
      'Tell me about interview prep.'
    )
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.getByText('Tell me about interview prep.')).toBeVisible()

    await page.getByRole('button', { name: 'Clear Chat' }).click()

    await expect(page.getByText('Hi Neranjana Silva. I am InternConnect Assistant.')).toBeVisible()
    await expect(page.getByText('Tell me about interview prep.')).not.toBeVisible()
  })

  test('shows fallback error message when chat endpoint fails', async ({ page }) => {
    await page.route('**/api/student-guidance/chat', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unable to stream AI response.' }),
      })
    })

    await page.fill(
      'textarea[placeholder="Ask about profile improvements, internship readiness, or career direction..."]',
      'Give me career advice.'
    )
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page.getByText('Unable to stream AI response.')).toBeVisible()
  })
})
