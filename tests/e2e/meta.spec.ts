import { test, expect } from '@playwright/test'

test('sitemap lists home and every write-up, without a fake lastmod', async ({ request }) => {
  const res = await request.get('/sitemap.xml')
  expect(res.ok()).toBeTruthy()
  const xml = await res.text()
  expect(xml).toContain('https://lukeghanna.com</loc>')
  for (const slug of ['pfc', 'beacon', 'ccc', 'bt', 'onair', 'shed', 'bjs']) expect(xml).toContain(`https://lukeghanna.com/work/${slug}</loc>`)
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
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /business administration at USC/)
})

test('the icon is the LH monogram as an SVG, with an apple icon rendered as a PNG', async ({ page, request }) => {
  const svg = await request.get('/icon.svg')
  expect(svg.ok()).toBeTruthy()
  expect(svg.headers()['content-type']).toContain('image/svg+xml')
  expect(await svg.text()).toContain('prefers-color-scheme:dark')
  const apple = await request.get('/apple-icon')
  expect(apple.ok()).toBeTruthy()
  expect(apple.headers()['content-type']).toContain('image/png')
  await page.goto('/')
  await expect(page.locator('link[rel="icon"][href*="icon.svg"]')).toHaveCount(1)
  await expect(page.locator('link[rel="icon"][href*="favicon.ico"]')).toHaveCount(0)
})

test('a web manifest names the site, the monogram icons and the standalone display', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest')
  expect(res.ok()).toBeTruthy()
  const m = await res.json()
  expect(m.name).toBe('Luke Hanna')
  expect(m.display).toBe('standalone')
  expect(m.icons.map((i: { src: string }) => i.src)).toEqual(['/icon.svg', '/apple-icon'])
})
