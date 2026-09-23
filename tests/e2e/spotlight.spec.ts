import { test, expect } from '@playwright/test'

test.describe('spotlight', () => {
  test('renders on a hover-capable desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover-capable projects only')
    await page.goto('/')
    await expect(page.getByTestId('spotlight')).toHaveCount(1)
  })

  test('is absent under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.getByTestId('spotlight')).toHaveCount(0)
  })
})
