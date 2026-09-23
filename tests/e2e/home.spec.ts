import { test, expect } from '@playwright/test'

test.describe('home', () => {
  test('lists the four projects with canonical links', async ({ page }) => {
    await page.goto('/')
    for (const slug of ['ccc', 'bt', 'shed', 'bjs']) await expect(page.getByTestId(`project-${slug}`)).toBeVisible()
    // Projects with a write-up link to it; the write-up's rail carries the live-site link.
    await expect(page.getByTestId('project-ccc')).toHaveAttribute('href', '/work/ccc')
    await expect(page.getByTestId('project-bt')).toHaveAttribute('href', '/work/bt')
    await expect(page.getByTestId('project-shed')).toHaveAttribute('href', 'https://shed.lukeghanna.com')
  })

  test('only Shedquarters has a screenshot reveal, shown on hover', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover only')
    await page.goto('/')
    await expect(page.getByTestId('reveal-shed')).toHaveCount(1)
    await expect(page.getByTestId('reveal-ccc')).toHaveCount(0)
    await page.getByTestId('project-shed').hover()
    await expect(page.getByTestId('reveal-shed')).toHaveAttribute('data-open', 'true')
  })

  test('contact shows the email and a build-time colophon', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#contact')).toContainText('luke@zhannas.com')
    await expect(page.locator('#contact')).toContainText(/last updated [A-Z][a-z]+ \d{4}/)
  })
})
