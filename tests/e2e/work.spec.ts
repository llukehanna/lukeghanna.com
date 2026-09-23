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

  test('renders CCC with the live-site link and a Next link to BT', async ({ page }) => {
    await page.goto('/work/ccc')
    await expect(page.getByRole('heading', { level: 1, name: 'Clippers Command Center' })).toBeVisible()
    await expect(page.locator('h2#provable-insights')).toBeVisible()
    const rail = page.getByTestId('rail')
    await expect(rail.getByRole('link', { name: /Live site/ })).toHaveAttribute('href', 'https://clippers.lukeghanna.com')
    await expect(rail.getByRole('link', { name: /Next/ })).toHaveAttribute('href', '/work/bt')
    await expect(rail.getByRole('link', { name: /Previous/ })).toHaveCount(0)
    const text = await page.getByTestId('article').innerText()
    expect(text).not.toMatch(/projected|estimated|illustrative/i)
  })

  test('the fixed rail scrolls internally when its content is taller than the viewport', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop-only: the rail is only fixed at lg+')
    await page.setViewportSize({ width: 1440, height: 700 })
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

  test('BT links back to CCC as Previous', async ({ page }) => {
    await page.goto('/work/bt')
    const rail = page.getByTestId('rail')
    await expect(rail.getByRole('link', { name: /Previous/ })).toHaveAttribute('href', '/work/ccc')
    await expect(rail.getByRole('link', { name: /Next/ })).toHaveCount(0)
  })

  test('a code block that fits its container is not a tab stop; one that overflows is', async ({ page, isMobile }) => {
    await page.goto('/work/bt')
    const blocks = page.getByTestId('article').locator('pre')
    const read = () =>
      blocks.evaluateAll((els) => els.map((el) => ({ overflows: el.scrollWidth > el.clientWidth, focusable: el.tabIndex === 0 })))
    // Focusability is set after hydration, once the block has been measured, so poll for the settled state.
    await expect.poll(async () => (await read()).every((s) => s.focusable === s.overflows)).toBe(true)
    const states = await read()
    expect(states.length).toBeGreaterThan(0)
    // The BT article's longest code line overflows a phone-width column and fits a desktop one.
    expect(states.some((s) => s.overflows)).toBe(isMobile)
  })

  test('unknown slug is a 404', async ({ page }) => {
    const res = await page.goto('/work/nope')
    expect(res?.status()).toBe(404)
  })
})
