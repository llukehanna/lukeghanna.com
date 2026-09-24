import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { projects } from '@/content/projects'

describe('projects', () => {
  it('has exactly the seven projects in order', () => {
    expect(projects.map((p) => p.slug)).toEqual(['pfc', 'beacon', 'ccc', 'kwx', 'onair', 'shed', 'bjs'])
  })
  it('has unique slugs and every row goes to its own write-up', () => {
    const slugs = new Set(projects.map((p) => p.slug))
    expect(slugs.size).toBe(projects.length)
    for (const p of projects) expect(p.href).toBe(`/work/${p.slug}`)
  })
  it('only references screenshots that exist in public', () => {
    for (const p of projects) {
      if (p.screenshot) expect(existsSync(`public${p.screenshot.src}`), `${p.slug} screenshot`).toBe(true)
    }
  })
  it('only projects with a real capture have a hover screenshot', () => {
    expect(projects.filter((p) => p.screenshot).map((p) => p.slug)).toEqual(['beacon', 'onair', 'shed'])
  })
  it('never uses projection language', () => {
    for (const p of projects) expect(p.description).not.toMatch(/projected|estimated|targeting/i)
  })
})
