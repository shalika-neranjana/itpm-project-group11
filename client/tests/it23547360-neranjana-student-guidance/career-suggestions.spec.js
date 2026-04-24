import { test, expect } from '@playwright/test'
import { setupGuidanceMocks } from './guidance-test-helpers'

test.describe('Student Guidance - Career Suggestions', () => {
  test.beforeEach(async ({ page }) => {
    await setupGuidanceMocks(page)
    await page.goto('/dashboard?tab=guidance')
    await page.getByRole('button', { name: 'Career Suggestions' }).click()
  })

  test('shows initial AI career cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Career Suggestions' })).toBeVisible()
    await expect(page.getByText('Software Engineer')).toBeVisible()
    await expect(page.getByText('Data Analyst')).toBeVisible()
  })

  test('filters careers using search and status', async ({ page }) => {
    await page.fill('input[placeholder="Search roles or keywords..."]', 'Data')
    await page.locator('select').first().selectOption('Promising fit')

    await expect(page.getByText('Data Analyst')).toBeVisible()
    await expect(page.getByText('Software Engineer')).not.toBeVisible()
  })

  test('refreshes AI suggestions and shows new recommendation', async ({ page }) => {
    await page.getByRole('button', { name: 'Refresh AI Suggestions' }).click()

    await expect(page.getByText('QA Engineer')).toBeVisible()
    await expect(page.getByText('Showing')).toBeVisible()
  })

  test('opens roadmap details and navigates back', async ({ page }) => {
    await page.getByRole('link', { name: 'View full AI analysis' }).first().click()

    await expect(page).toHaveURL(/\/student-guidance\/career\//)
    await expect(page.getByText('AI Career Guide')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Comprehensive AI Analysis' })).toBeVisible()

    await page.getByRole('button', { name: 'Back to Suggestions' }).first().click()
    await expect(page).toHaveURL(/\/dashboard\?tab=guidance/)
  })
})
