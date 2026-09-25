import { test, expect } from '@playwright/test'

test.describe('rail', () => {
  test('shows name, tagline, nav, and links', async ({ page, isMobile }) => {
    await page.goto('/')
    const rail = page.getByTestId('rail')
    await expect(rail.getByRole('heading', { level: 1, name: 'Luke Hanna' })).toBeVisible()
    await expect(rail.getByText('Builds things end-to-end to understand them.')).toBeVisible()
    // On a phone the header is just the name; the links live in Contact at the end of the page.
    const links = isMobile ? page.locator('#contact') : rail
    await expect(links.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/llukehanna')
    await expect(isMobile ? page.getByTestId('copy-email') : rail.getByRole('link', { name: /Email/ })).toHaveAttribute('href', 'mailto:luke@zhannas.com')
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

  test('projects are listed under Projects and track the card in view', async ({ page, isMobile }) => {
    test.skip(isMobile, 'the rail nav is md+')
    await page.goto('/')
    const rail = page.getByTestId('rail')
    for (const slug of ['pfc', 'beacon', 'ccc', 'kwx', 'onair', 'shed', 'bjs']) await expect(rail.getByTestId(`nav-${slug}`)).toHaveAttribute('href', `#${slug}`)
    await page.getByTestId('project-onair').scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollBy(0, 1))
    await expect(rail.getByTestId('nav-projects')).toHaveAttribute('aria-current', 'true')
    await expect(rail.locator('[data-testid^="nav-"][aria-current="true"]').filter({ hasNotText: 'Projects' })).toHaveCount(1)
  })

  test('specular overlay covers the rail', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop-only: rail is lg:fixed, where the overlay bug manifested')
    await page.goto('/')
    const railBox = await page.getByTestId('rail').boundingBox()
    const specularBox = await page.getByTestId('rail-specular').boundingBox()
    expect(railBox).not.toBeNull()
    expect(specularBox).not.toBeNull()
    expect(Math.abs(specularBox!.width - railBox!.width)).toBeLessThanOrEqual(1)
    expect(Math.abs(specularBox!.height - railBox!.height)).toBeLessThanOrEqual(1)
  })
})
