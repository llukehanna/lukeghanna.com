import { test, expect } from '@playwright/test'

import type { Page } from '@playwright/test'

const slugs = ['pfc', 'beacon', 'ccc', 'kwx', 'onair', 'shed', 'bjs']

// Below md the rail hides its link list and the same links close the article instead.
const linksOf = (page: Page, isMobile: boolean) => (isMobile ? page.getByTestId('article-footer') : page.getByTestId('rail'))

test.describe('write-up', () => {
  test('renders Kalshi Weather Edge with headings that have ids matching the contents', async ({ page, isMobile }) => {
    await page.goto('/work/kwx')
    await expect(page.getByRole('heading', { level: 1, name: 'Kalshi Weather Edge' })).toBeVisible()
    await expect(page.locator('h2#what-it-does')).toBeVisible()
    await expect(page.locator('h2#the-result')).toBeVisible()
    // Desktop (xl): the sidebar lists the sections and the rail does not repeat them. Phone: the
    // sticky bar's menu does (mobile.spec covers opening it).
    if (isMobile) await expect(page.getByTestId('navbar-what-it-does')).toHaveCount(1)
    else {
      await expect(page.getByTestId('nav-what-it-does').filter({ visible: true })).toHaveCount(1)
      await expect(page.getByTestId('rail').getByTestId('nav-what-it-does')).toBeHidden()
    }
  })

  test('Kalshi Weather Edge states the negative result, the fee formula, the unrun market maker, and no projection language', async ({ page }) => {
    await page.goto('/work/kwx')
    const text = await page.getByTestId('article').innerText()
    expect(text).toContain('fee  = 0.07 * P * (1 - P)')
    expect(text).toContain('7,440')
    expect(text).toMatch(/no orders? (was ever |were )?placed/i)
    expect(text).toMatch(/zero orders on demo or live/i)
    expect(text).not.toMatch(/projected|estimated|illustrative/i)
  })

  test('renders CCC with an Open link to the live site and Previous / Next neighbours', async ({ page, isMobile }) => {
    await page.goto('/work/ccc')
    await expect(page.getByRole('heading', { level: 1, name: 'Clippers Command Center' })).toBeVisible()
    await expect(page.locator('h2#provable-insights')).toBeVisible()
    await expect(page.getByTestId('rail').getByTestId('open-app')).toHaveAttribute('href', 'https://clippers.lukeghanna.com')
    const links = linksOf(page, isMobile)
    await expect(links.getByRole('link', { name: /Previous/ })).toHaveAttribute('href', '/work/beacon')
    await expect(links.getByRole('link', { name: /Next/ })).toHaveAttribute('href', '/work/kwx')
  })

  test('the first and last write-ups have only one neighbour', async ({ page, isMobile }) => {
    await page.goto('/work/pfc')
    let links = linksOf(page, isMobile)
    await expect(links.getByRole('link', { name: /Previous/ })).toHaveCount(0)
    await expect(links.getByRole('link', { name: /Next/ })).toHaveAttribute('href', '/work/beacon')
    await page.goto('/work/bjs')
    links = linksOf(page, isMobile)
    await expect(links.getByRole('link', { name: /Previous/ })).toHaveAttribute('href', '/work/shed')
    await expect(links.getByRole('link', { name: /Next/ })).toHaveCount(0)
  })

  test('every write-up renders, names its state, and avoids projection language', async ({ page }) => {
    for (const slug of slugs) {
      await page.goto(`/work/${slug}`)
      await expect(page.getByTestId('rail').getByRole('term').filter({ hasText: 'Status' })).toHaveCount(1)
      const text = await page.getByTestId('article').innerText()
      expect(text, slug).not.toMatch(/projected|estimated|illustrative/i)
    }
  })

  test('the fixed rail scrolls internally when its content is taller than the viewport', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop-only: the rail is only fixed at lg+')
    await page.setViewportSize({ width: 1440, height: 520 })
    await page.goto('/work/ccc')
    const rail = page.getByTestId('rail')
    const m = await rail.evaluate((el) => ({
      overflows: el.scrollHeight > el.clientHeight,
      overflowY: getComputedStyle(el).overflowY,
      bottom: el.getBoundingClientRect().bottom,
    }))
    expect(m.overflows).toBe(true)
    expect(m.overflowY).toBe('auto')
    // Nothing spills past the card: the last row is inside it once the rail is scrolled to its end.
    await rail.evaluate((el) => el.scrollTo(0, el.scrollHeight))
    const lastBottom = await rail.evaluate((el) => el.lastElementChild!.getBoundingClientRect().bottom)
    expect(lastBottom).toBeLessThanOrEqual(m.bottom)
    await expect(rail.getByRole('link', { name: /Next/ })).toBeInViewport()
  })

  test('figures carry a number, a caption and a provenance line', async ({ page }) => {
    await page.goto('/work/shed')
    const figures = page.getByTestId('article').locator('figure')
    expect(await figures.count()).toBeGreaterThanOrEqual(3)
    const first = figures.first()
    await expect(first.locator('figcaption')).toContainText('Fig. 1')
    await expect(first.locator('figcaption')).toContainText('Recorded from the real app')
    const video = first.locator('video')
    await expect(video).toHaveAttribute('poster', '/work/shed/table.png')
    await expect(video.locator('track[kind="captions"]')).toHaveCount(1)
    // A flow diagram is a figure too, drawn from the code.
    await expect(page.getByTestId('article').locator('figure', { hasText: 'Serialized drain' })).toHaveCount(1)
  })

  test('Beacon shows four production captures of synthetic data, each with provenance', async ({ page }) => {
    await page.goto('/work/beacon')
    const article = page.getByTestId('article')
    await expect(article.locator('figure img')).toHaveCount(4)
    const captions = await article.locator('figure:has(img) figcaption').allInnerTexts()
    for (const c of captions) expect(c).toMatch(/live demo|synthetic/i)
    await expect(page.getByTestId('rail').getByTestId('open-app')).toHaveAttribute('href', 'https://beacon.lukeghanna.com')
  })

  test('PFC shows three screens with invented amounts, each saying so, plus its flow', async ({ page }) => {
    await page.goto('/work/pfc')
    const article = page.getByTestId('article')
    await expect(article.locator('figure img')).toHaveCount(3)
    await expect(article.locator('figure')).toHaveCount(4)
    for (const cap of await article.locator('figure:has(img) figcaption').allInnerTexts()) expect(cap).toMatch(/invented/)
    await expect(article.locator('table')).toHaveCount(2)
  })

  test('results tables scroll inside their own box instead of widening the page', async ({ page }) => {
    await page.goto('/work/kwx')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(overflow).toBe(false)
    expect(await page.getByTestId('article').locator('table').count()).toBeGreaterThanOrEqual(3)
  })

  test('a code block that fits its container is not a tab stop; one that overflows is', async ({ page, isMobile }) => {
    await page.goto('/work/kwx')
    const blocks = page.getByTestId('article').locator('pre')
    const read = () =>
      blocks.evaluateAll((els) => els.map((el) => ({ overflows: el.scrollWidth > el.clientWidth, focusable: el.tabIndex === 0 })))
    // Focusability is set after hydration, once the block has been measured, so poll for the settled state.
    await expect.poll(async () => (await read()).every((s) => s.focusable === s.overflows)).toBe(true)
    const states = await read()
    expect(states.length).toBeGreaterThan(0)
    // The article's longest code line overflows a phone-width column and fits a desktop one.
    expect(states.some((s) => s.overflows)).toBe(isMobile)
  })

  test('unknown slug is a 404', async ({ page }) => {
    const res = await page.goto('/work/nope')
    expect(res?.status()).toBe(404)
  })
})
