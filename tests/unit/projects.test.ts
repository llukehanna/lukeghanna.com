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
  it('shows a real capture where one exists and a figure everywhere else, never both', () => {
    expect(projects.filter((p) => p.screenshot).map((p) => p.slug)).toEqual(['pfc', 'beacon', 'ccc', 'onair', 'shed', 'bjs'])
    // PFC's image is a recreation (its real screens show real balances), and says so.
    expect(projects.find((p) => p.slug === 'pfc')?.screenshot?.note).toMatch(/recreation/i)
    for (const p of projects) expect(!!p.screenshot !== !!p.figure, p.slug).toBe(true)
  })
  it('keeps each card to one or two sentences', () => {
    for (const p of projects) expect(p.description.length, p.slug).toBeLessThanOrEqual(140)
  })
  it('never uses projection language', () => {
    for (const p of projects) expect(p.description).not.toMatch(/projected|estimated|targeting/i)
  })
})
