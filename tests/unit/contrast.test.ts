import { describe, it, expect } from 'vitest'
import { contrastRatio, relativeLuminance } from '@/lib/contrast'

describe('contrast', () => {
  it('computes luminance of white and black', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5)
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5)
  })
  it('white on black is 21:1', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1)
  })
  it('is symmetric', () => {
    expect(contrastRatio('#f2c14e', '#131110')).toBeCloseTo(contrastRatio('#131110', '#f2c14e'), 6)
  })
})
