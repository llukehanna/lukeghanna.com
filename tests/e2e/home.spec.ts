import { test, expect } from '@playwright/test'

test.describe('home', () => {
  const slugs = ['pfc', 'beacon', 'ccc', 'kwx', 'onair', 'solitaire', 'aglow', 'shed', 'bjs']

  test('about comes first, then every project, each linking to its write-up', async ({ page }) => {
    await page.goto('/')
    const [about, projects] = await Promise.all([page.locator('#about').boundingBox(), page.locator('#projects').boundingBox()])
    expect(about!.y).toBeLessThan(projects!.y)
    for (const slug of slugs) await expect(page.getByTestId(`project-${slug}`)).toHaveAttribute('href', `/work/${slug}`)
    await expect(page.locator('#projects a')).toHaveCount(slugs.length)
    // The status line describes the project, not the link: the live domain still shows for live sites.
    await expect(page.getByTestId('project-ccc')).toContainText('clippers.lukeghanna.com')
    await expect(page.getByTestId('project-kwx')).toContainText('demo pending')
    await expect(page.locator('#projects h2')).toHaveText('Projects')
  })

  test('six cards in the grid, the rest as one-line rows in the index under it', async ({ page }) => {
    await page.goto('/')
    const more = page.getByTestId('more-projects')
    await expect(more.getByRole('link')).toHaveCount(3)
    for (const slug of ['aglow', 'shed', 'bjs']) {
      await expect(more.getByTestId(`project-${slug}`)).toBeVisible()
      await expect(page.getByTestId(`project-${slug}`).locator('img')).toHaveCount(0)
    }
    await expect(more).toContainText('09')
    const [lastCard, index] = await Promise.all([page.getByTestId('project-solitaire').boundingBox(), more.boundingBox()])
    expect(index!.y).toBeGreaterThan(lastCard!.y + lastCard!.height - 1)
  })

  test('cards with a real capture show it; the rest show a figure from the write-up', async ({ page }) => {
    await page.goto('/')
    for (const slug of ['pfc', 'beacon', 'ccc', 'onair', 'solitaire']) await expect(page.getByTestId(`project-${slug}`).locator('img')).toHaveCount(1)
    await expect(page.getByTestId('project-kwx').locator('img')).toHaveCount(0)
    await expect(page.getByTestId('project-kwx')).toContainText('7,440')
  })

  test('about carries two facts', async ({ page }) => {
    await page.goto('/')
    const about = page.locator('#about')
    await expect(about.getByRole('term')).toHaveCount(2)
    for (const k of ['Builds with', 'Shipped']) await expect(about.getByRole('term').filter({ hasText: k })).toHaveCount(1)
    await expect(about).toContainText('9 projects · 5 live sites')
    await expect(page.locator('body')).not.toContainText(/Houlihan/)
  })

  test('contact copies the email and shows a build-time colophon', async ({ page, context, browserName }) => {
    await page.goto('/')
    const contact = page.locator('#contact')
    const copy = page.getByTestId('copy-email')
    await expect(copy).toContainText('luke@zhannas.com')
    await expect(copy).toHaveAttribute('href', 'mailto:luke@zhannas.com')
    await expect(contact).toContainText(/last updated [A-Z][a-z]+ \d{4}/)
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only here')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await copy.click()
    await expect(copy).toContainText('Copied')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('luke@zhannas.com')
  })
})
