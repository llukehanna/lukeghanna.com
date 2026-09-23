import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { projects } from '@/content/projects'

describe('projects', () => {
  it('has exactly the four projects in order', () => {
    expect(projects.map((p) => p.slug)).toEqual(['ccc', 'bt', 'shed', 'bjs'])
  })
  it('has unique slugs and absolute or root-relative hrefs', () => {
    const slugs = new Set(projects.map((p) => p.slug))
    expect(slugs.size).toBe(projects.length)
    for (const p of projects) expect(p.href).toMatch(/^(https?:\/\/|\/)/)
  })
  it('only references screenshots that exist in public', () => {
    for (const p of projects) {
      if (p.screenshot) expect(existsSync(`public${p.screenshot.src}`), `${p.slug} screenshot`).toBe(true)
    }
  })
  it('in v1 only Shedquarters has a screenshot', () => {
    expect(projects.filter((p) => p.screenshot).map((p) => p.slug)).toEqual(['shed'])
  })
  it('never uses projection language', () => {
    for (const p of projects) expect(p.description).not.toMatch(/projected|estimated|targeting/i)
  })
})
