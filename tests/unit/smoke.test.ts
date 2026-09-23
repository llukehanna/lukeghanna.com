import { describe, it, expect } from 'vitest'
import { siteName } from '@/lib/site'

describe('site config', () => {
  it('exposes the site name', () => {
    expect(siteName).toBe('Luke Hanna')
  })
})
