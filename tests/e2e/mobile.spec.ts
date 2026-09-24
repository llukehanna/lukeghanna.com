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

  test('a write-up reaches its article quickly: compact rail, sticky bar with a contents menu', async ({ page }) => {
    await page.goto('/work/kwx')
    // The rail's contents and link lists are hidden below md; the article starts well within two screens.
    await expect(page.getByTestId('rail').getByTestId('nav-what-it-does')).toBeHidden()
    const top = await page.getByTestId('article').evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
    expect(top).toBeLessThan(720)

    const bar = page.getByRole('navigation', { name: 'Article (mobile)' })
    await expect(bar).toBeVisible()
    await expect(bar.getByRole('link', { name: /Work/ })).toHaveAttribute('href', '/#work')
    const menu = page.getByTestId('article-contents')
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await menu.click()
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('#article-contents-list')).toBeVisible()
    await page.getByTestId('navbar-the-result').click()
    await expect(page.locator('#article-contents-list')).toBeHidden()
    await expect(page.getByTestId('navbar-the-result')).toHaveAttribute('aria-current', 'true')
    await expect(menu).toContainText('The result')
    // Sticky: the bar is pinned once the page has scrolled.
    const box = await bar.boundingBox()
    expect(Math.abs(box!.y)).toBeLessThanOrEqual(1)
  })

  test('a write-up closes with the at-a-glance table and its links on a phone', async ({ page }) => {
    await page.goto('/work/ccc')
    await expect(page.getByText('At a glance', { exact: true }).filter({ visible: true })).toHaveCount(1)
    const footer = page.getByTestId('article-footer')
    await footer.scrollIntoViewIfNeeded()
    await expect(footer.getByRole('link', { name: /Source/ })).toBeVisible()
    await expect(footer.getByRole('link', { name: /Next/ })).toHaveAttribute('href', '/work/kwx')
  })

  test('project rows put the number inline with the title and the tiles collapse to one card', async ({ page }) => {
    await page.goto('/')
    const row = page.getByTestId('project-pfc')
    await expect(row).toContainText('01')
    const numberBox = await row.locator('span', { hasText: '01' }).filter({ visible: true }).first().boundingBox()
    const titleBox = await row.getByText('Personal Finance Coach').boundingBox()
    expect(Math.abs(numberBox!.y + numberBox!.height / 2 - (titleBox!.y + titleBox!.height / 2))).toBeLessThan(titleBox!.height)
    const tiles = page.locator('#about dl > div')
    await expect(tiles).toHaveCount(4)
    const boxes = await tiles.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))
    for (const h of boxes) expect(h).toBeLessThan(80)
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
