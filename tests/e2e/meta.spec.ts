import { test, expect } from '@playwright/test'

test('sitemap lists home and the BT write-up', async ({ request }) => {
  const res = await request.get('/sitemap.xml')
  expect(res.ok()).toBeTruthy()
  const xml = await res.text()
  expect(xml).toContain('https://lukeghanna.com</loc>')
  expect(xml).toContain('https://lukeghanna.com/work/bt</loc>')
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
