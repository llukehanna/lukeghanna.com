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

  test('project cards stack in one column', async ({ page }) => {
    await page.goto('/')
    const [a, b] = await Promise.all([page.getByTestId('project-pfc').boundingBox(), page.getByTestId('project-beacon').boundingBox()])
    expect(Math.abs(a!.x - b!.x)).toBeLessThanOrEqual(1)
    expect(b!.y).toBeGreaterThan(a!.y + a!.height - 1)
    await expect(page.getByTestId('project-more')).toBeHidden()
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
    await page.getByTestId('navbar-projects').click()
    await expect(page.getByTestId('navbar-projects')).toHaveAttribute('aria-current', 'true')
    // The section's scroll-margin-top and the bar's height are the same CSS variable.
    const [barBox, sectionTop] = await Promise.all([
      bar.boundingBox(),
      page.locator('#projects').evaluate((el) => el.getBoundingClientRect().top),
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
    await expect(bar.getByRole('link', { name: /Projects/ })).toHaveAttribute('href', '/#projects')
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

  test('the about facts are compact rows and the header is not a full-screen card', async ({ page }) => {
    await page.goto('/')
    const rows = page.locator('#about dl > div')
    await expect(rows).toHaveCount(3)
    for (const h of await rows.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))) expect(h).toBeLessThan(80)
    const rail = await page.getByTestId('rail').boundingBox()
    expect(rail!.height).toBeLessThan(300)
  })

  test('contact puts the email first and the two links side by side', async ({ page }) => {
    await page.goto('/')
    const contact = page.locator('#contact')
    const copy = await page.getByTestId('copy-email').boundingBox()
    const [gh, li] = await Promise.all(['GitHub', 'LinkedIn'].map((name) => contact.getByRole('link', { name: new RegExp(name) }).boundingBox()))
    expect(gh!.y).toBeGreaterThan(copy!.y + copy!.height - 1)
    expect(Math.abs(gh!.y - li!.y)).toBeLessThanOrEqual(2)
  })
})
