import { test, expect } from '@playwright/test'
import { setupGuidanceMocks } from './guidance-test-helpers'

test.describe('Student Guidance - Interests', () => {
  test.beforeEach(async ({ page }) => {
    await setupGuidanceMocks(page)
    await page.goto('/dashboard?tab=guidance')
    await page.getByRole('button', { name: 'My Interests' }).click()
  })

  test('adds a new interest', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Interest' }).click()
    await page.fill('input[placeholder="e.g., Product Design"]', 'Cyber Security')
    await page.locator('form select').selectOption('Technology')
    await page.locator('form button[type="submit"]').filter({ hasText: 'Add' }).click()

    await expect(page.getByText('Cyber Security')).toBeVisible()
  })

  test('edits an existing interest name', async ({ page }) => {
    const interestCard = page.locator('article', { hasText: 'Web Development' }).first()
    await interestCard.getByRole('button', { name: 'Edit interest' }).click()
    await page.fill('input[placeholder="e.g., Product Design"]', 'Full Stack Development')
    await page.locator('form button[type="submit"]').filter({ hasText: 'Update' }).click()

    await expect(page.getByText('Full Stack Development')).toBeVisible()
    await expect(page.getByText('Web Development')).not.toBeVisible()
  })

  test('filters interests by search and category', async ({ page }) => {
    await page.fill('input[placeholder="Search interests..."]', 'Data')
    await page.locator('select').first().selectOption('Analytics')

    await expect(page.getByText('Data Analytics')).toBeVisible()
    await expect(page.getByText('Web Development')).not.toBeVisible()
  })

  test('updates and clears aspiration note', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit career aspiration' }).click()
    await page.fill(
      'textarea[placeholder="I want to work on products that improve digital accessibility."]',
      'I want to become a cybersecurity engineer.'
    )
    await page.getByRole('button', { name: 'Save Note' }).click()

    await expect(page.getByText('I want to become a cybersecurity engineer.')).toBeVisible()

    await page.getByRole('button', { name: 'Delete career aspiration' }).click()
    await expect(page.getByText('Add your aspiration note to guide smarter career recommendations.')).toBeVisible()
  })
})
