import { test, expect } from '@playwright/test'

test('sitemap lists home and both write-ups, without a fake lastmod', async ({ request }) => {
  const res = await request.get('/sitemap.xml')
  expect(res.ok()).toBeTruthy()
  const xml = await res.text()
  expect(xml).toContain('https://lukeghanna.com</loc>')
  expect(xml).toContain('https://lukeghanna.com/work/ccc</loc>')
  expect(xml).toContain('https://lukeghanna.com/work/bt</loc>')
  // The only date available at build time is the build date, which is not a modification date.
  expect(xml).not.toContain('<lastmod>')
})

test('robots allows crawling and points at the sitemap', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text()
  expect(txt).toMatch(/Allow: \//)
  expect(txt).toContain('Sitemap: https://lukeghanna.com/sitemap.xml')
})

test('open graph image is served as a PNG', async ({ request }) => {
  const res = await request.get('/opengraph-image')
  expect(res.ok()).toBeTruthy()
  expect(res.headers()['content-type']).toContain('image/png')
})

test('home has og:image and a description', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Houlihan Lokey/)
})
