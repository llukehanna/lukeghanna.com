import { test, expect } from '@playwright/test'

test.describe('write-up', () => {
  test('renders BT with headings that have ids matching the contents', async ({ page }) => {
    await page.goto('/work/bt')
    await expect(page.getByRole('heading', { level: 1, name: 'BT' })).toBeVisible()
    await expect(page.locator('h2#what-it-does')).toBeVisible()
    await expect(page.locator('h2#math')).toBeVisible()
    await expect(page.getByTestId('rail').getByTestId('nav-what-it-does')).toBeVisible()
  })

  test('contains the fee formula and no projection language', async ({ page }) => {
    await page.goto('/work/bt')
    const text = await page.getByTestId('article').innerText()
    expect(text).toContain('fee  = 0.07 * P * (1 - P)')
    expect(text).not.toMatch(/projected|estimated|illustrative/i)
  })

  test('unknown slug is a 404', async ({ page }) => {
    const res = await page.goto('/work/nope')
    expect(res?.status()).toBe(404)
  })
})
