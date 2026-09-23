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

test('every project row is reachable by keyboard and shows focus', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('project-ccc').focus()
  await expect(page.getByTestId('project-ccc')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByTestId('project-bt')).toBeFocused()
})
