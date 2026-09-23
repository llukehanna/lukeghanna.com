import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const path of ['/', '/work/bt']) {
  for (const theme of ['dark', 'light'] as const) {
    test(`${path} has no axe violations in ${theme}`, async ({ page }) => {
      await page.goto(path)
      await page.getByTestId(`theme-${theme}`).click()
      await expect(page.locator('html')).toHaveClass(theme === 'dark' ? /dark/ : /^(?!.*dark).*$/)
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
    })
  }
}

test('every project row is reachable by keyboard and shows a visible focus ring', async ({ page }) => {
  await page.goto('/')
  const row = page.getByTestId('project-ccc')
  await row.focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(row).toBeFocused()
  const outline = await row.evaluate((el) => {
    const s = getComputedStyle(el)
    return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), color: s.outlineColor }
  })
  expect(outline.style).not.toBe('none')
  expect(outline.width).toBeGreaterThanOrEqual(2)
  await page.keyboard.press('Tab')
  await expect(page.getByTestId('project-bt')).toBeFocused()
})
