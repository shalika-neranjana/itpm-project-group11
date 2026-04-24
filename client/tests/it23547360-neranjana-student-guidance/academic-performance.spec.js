import { test, expect } from '@playwright/test'
import { setupGuidanceMocks } from './guidance-test-helpers'

test.describe('Student Guidance - Academic Performance', () => {
  test.beforeEach(async ({ page }) => {
    await setupGuidanceMocks(page)
    await page.goto('/dashboard?tab=guidance')
  })

  test('shows academic performance with student identity', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Academic Performance' })).toBeVisible()
    await expect(page.getByText('Neranjana Silva (IT23547360)')).toBeVisible()
    await expect(page.getByText('Year 1 | Semester 1')).toBeVisible()
  })

  test('filters by subject search text', async ({ page }) => {
    await page.fill('input[placeholder="Search subject code/name/grade..."]', 'CS101')

    await expect(page.getByText('Programming Fundamentals')).toBeVisible()
    await expect(page.getByText('Discrete Mathematics')).not.toBeVisible()
  })

  test('filters by year and semester selectors', async ({ page }) => {
    const selects = page.locator('select')

    await selects.nth(0).selectOption('2')
    await selects.nth(1).selectOption('1')

    await expect(page.getByText('Year 2 | Semester 1')).toBeVisible()
    await expect(page.getByText('Software Engineering')).toBeVisible()
    await expect(page.getByText('Year 1 | Semester 1')).not.toBeVisible()
  })

  test('shows empty result message when no subject matches', async ({ page }) => {
    await page.fill('input[placeholder="Search subject code/name/grade..."]', 'ZZZ-404')

    await expect(page.getByText('No matching academic results')).toBeVisible()
  })
})
