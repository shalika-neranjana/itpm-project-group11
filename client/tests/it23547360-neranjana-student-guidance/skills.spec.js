import { test, expect } from '@playwright/test'
import { setupGuidanceMocks } from './guidance-test-helpers'

test.describe('Student Guidance - Skills', () => {
  test.beforeEach(async ({ page }) => {
    await setupGuidanceMocks(page)
    await page.goto('/dashboard?tab=guidance')
    await page.getByRole('button', { name: 'Skills' }).click()
  })

  test('adds a new skill to the selected level lane', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Skill' }).click()
    await page.fill('input[placeholder="e.g., React"]', 'TypeScript')
    await page.locator('form select').nth(0).selectOption('Programming')
    await page.locator('form select').nth(1).selectOption('Advanced')
    await page.locator('form button[type="submit"]').filter({ hasText: 'Add' }).click()

    await expect(page.getByText('TypeScript')).toBeVisible()
    await expect(page.locator('section', { hasText: 'Advanced' }).getByText('TypeScript')).toBeVisible()
  })

  test('edits an existing skill', async ({ page }) => {
    const skillCard = page.locator('article', { hasText: 'React' }).first()
    await skillCard.getByRole('button', { name: 'Edit skill' }).click()
    await page.fill('input[placeholder="e.g., React"]', 'React Testing Library')
    await page.locator('form button[type="submit"]').filter({ hasText: 'Update' }).click()

    await expect(page.getByText('React Testing Library')).toBeVisible()
  })

  test('filters by category and level', async ({ page }) => {
    await page.locator('select').nth(1).selectOption('Backend')
    await page.locator('select').nth(2).selectOption('Beginner')

    await expect(page.getByText('Node.js')).toBeVisible()
    await expect(page.getByText('React')).not.toBeVisible()
  })

  test('deletes a skill', async ({ page }) => {
    const skillCard = page.locator('article', { hasText: 'Node.js' }).first()
    await skillCard.getByRole('button', { name: 'Delete skill' }).click()

    await expect(page.getByText('Node.js')).not.toBeVisible()
  })
})
