// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { prefersReducedMotion, isHoverCapable } from '@/lib/motion'

function mockMatchMedia(matches: Record<string, boolean>) {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: matches[q] ?? false, media: q, addEventListener() {}, removeEventListener() {} }))
}

describe('motion helpers', () => {
  it('reports reduced motion when the media query matches', () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    expect(prefersReducedMotion()).toBe(true)
  })
  it('reports hover capability from (hover: hover)', () => {
    mockMatchMedia({ '(hover: hover)': false })
    expect(isHoverCapable()).toBe(false)
    mockMatchMedia({ '(hover: hover)': true })
    expect(isHoverCapable()).toBe(true)
  })
  it('is safe without window', () => {
    vi.stubGlobal('window', undefined)
    expect(prefersReducedMotion()).toBe(false)
    expect(isHoverCapable()).toBe(true)
    vi.unstubAllGlobals()
  })
})
