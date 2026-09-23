import { test, expect } from '@playwright/test'

test.describe('rail', () => {
  test('shows name, tagline, nav, and links', async ({ page }) => {
    await page.goto('/')
    const rail = page.getByTestId('rail')
    await expect(rail.getByRole('heading', { level: 1, name: 'Luke Hanna' })).toBeVisible()
    await expect(rail.getByText('Builds things end-to-end to understand them.')).toBeVisible()
    await expect(rail.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/llukehanna')
    await expect(rail.getByRole('link', { name: /Email/ })).toHaveAttribute('href', 'mailto:luke@lukeghanna.com')
  })

  test('theme toggle switches the html class and persists', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('theme-dark').click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.getByTestId('theme-light').click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('section nav tracks scrolling', async ({ page }) => {
    await page.goto('/')
    await page.locator('#contact').scrollIntoViewIfNeeded()
    await expect(page.getByTestId('nav-contact')).toHaveAttribute('aria-current', 'true')
  })
})
