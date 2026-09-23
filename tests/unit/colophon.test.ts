import { describe, it, expect } from 'vitest'
import { buildLabel } from '@/lib/colophon'

describe('buildLabel', () => {
  it('formats a date as Month YYYY in English', () => {
    expect(buildLabel(new Date('2026-09-22T12:00:00Z'))).toBe('September 2026')
    expect(buildLabel(new Date('2027-01-03T12:00:00Z'))).toBe('January 2027')
  })
  it('defaults to now', () => {
    expect(buildLabel()).toMatch(/^[A-Z][a-z]+ \d{4}$/)
  })
})
