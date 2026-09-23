import { test, expect } from '@playwright/test'

test.describe('mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile project only')

  test('rail sits above content and the page does not scroll horizontally', async ({ page }) => {
    await page.goto('/')
    const rail = await page.getByTestId('rail').boundingBox()
    const about = await page.locator('#about').boundingBox()
    expect(rail && about && rail.y + rail.height <= about.y + 1).toBeTruthy()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(overflow).toBe(false)
  })

  test('project rows stack and the screenshot reveal is not rendered', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('project-shed')).toBeVisible()
    await expect(page.getByTestId('reveal-shed')).toBeHidden()
  })

  test('section nav becomes a sticky top bar with three links that tracks scroll', async ({ page }) => {
    await page.goto('/')
    const bar = page.getByRole('navigation', { name: 'Sections (mobile)' })
    await expect(bar).toBeVisible()
    await expect(bar.getByRole('link')).toHaveCount(3)

    await page.locator('#contact').scrollIntoViewIfNeeded()
    await expect(page.getByTestId('navbar-contact')).toHaveAttribute('aria-current', 'true')

    // Sticky: after scrolling past the rail the bar is pinned to the top edge of the viewport.
    const scrolled = await page.evaluate(() => window.scrollY)
    expect(scrolled).toBeGreaterThan(0)
    const box = await bar.boundingBox()
    expect(box).not.toBeNull()
    expect(Math.abs(box!.y)).toBeLessThanOrEqual(1)
  })

  test('an anchor jump lands the section heading just below the bar, never under it', async ({ page }) => {
    await page.goto('/')
    const bar = page.getByRole('navigation', { name: 'Sections (mobile)' })
    await page.getByTestId('navbar-work').click()
    await expect(page.getByTestId('navbar-work')).toHaveAttribute('aria-current', 'true')
    // The section's scroll-margin-top and the bar's height are the same CSS variable.
    const [barBox, sectionTop] = await Promise.all([
      bar.boundingBox(),
      page.locator('#work').evaluate((el) => el.getBoundingClientRect().top),
    ])
    expect(barBox).not.toBeNull()
    expect(sectionTop).toBeGreaterThanOrEqual(barBox!.height - 1)
  })

  test('contact links lay out in a single row on the rail', async ({ page }) => {
    await page.goto('/')
    const rail = page.getByTestId('rail')
    const boxes = await Promise.all(
      ['GitHub', 'LinkedIn', 'Email'].map((name) => rail.getByRole('link', { name }).boundingBox()),
    )
    const [first, ...rest] = boxes
    expect(first).not.toBeNull()
    for (const box of rest) {
      expect(box).not.toBeNull()
      expect(Math.abs(box!.y - first!.y)).toBeLessThanOrEqual(2)
    }
  })
})
