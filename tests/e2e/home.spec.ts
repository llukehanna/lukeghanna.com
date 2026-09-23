import { test, expect } from '@playwright/test'

test.describe('home', () => {
  const slugs = ['hurdle', 'beacon', 'ccc', 'bt', 'onair', 'shed', 'bjs']

  test('lists the seven projects, each linking to its write-up', async ({ page }) => {
    await page.goto('/')
    for (const slug of slugs) await expect(page.getByTestId(`project-${slug}`)).toHaveAttribute('href', `/work/${slug}`)
    // The status line describes the project, not the link: the live domain still shows for live sites.
    await expect(page.getByTestId('project-ccc')).toContainText('clippers.lukeghanna.com')
    await expect(page.getByTestId('project-bt')).toContainText('research result')
    await expect(page.locator('#work')).toContainText('7 projects')
  })

  test('only projects with a real capture have a screenshot reveal, shown on hover', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover only')
    await page.goto('/')
    await expect(page.getByTestId('reveal-shed')).toHaveCount(1)
    await expect(page.getByTestId('reveal-onair')).toHaveCount(1)
    for (const slug of ['hurdle', 'beacon', 'ccc', 'bt', 'bjs']) await expect(page.getByTestId(`reveal-${slug}`)).toHaveCount(0)
    await page.getByTestId('project-shed').hover()
    await expect(page.getByTestId('reveal-shed')).toHaveAttribute('data-open', 'true')
  })

  test('about names the fellowship and the four tiles', async ({ page }) => {
    await page.goto('/')
    const about = page.locator('#about')
    await expect(about).toContainText('American Tech Fellowship')
    for (const tile of ['Now', 'Palantir', 'Builds with', 'Shipped']) await expect(about.getByRole('term').filter({ hasText: tile })).toHaveCount(1)
    await expect(about).toContainText('7 projects · 2 live sites')
    await expect(page.locator('body')).not.toContainText(/Houlihan/)
  })

  test('contact shows the email and a build-time colophon', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#contact')).toContainText('luke@zhannas.com')
    await expect(page.locator('#contact')).toContainText(/last updated [A-Z][a-z]+ \d{4}/)
  })
})
