import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { projects } from '@/content/projects'

describe('projects', () => {
  it('has exactly the eight projects in order', () => {
    expect(projects.map((p) => p.slug)).toEqual(['pfc', 'beacon', 'ccc', 'kwx', 'onair', 'solitaire', 'aglow', 'shed', 'bjs'])
  })
  it('keeps the grid at six, ahead of the index', () => {
    expect(projects.filter((p) => p.selected).map((p) => p.slug)).toEqual(['pfc', 'beacon', 'ccc', 'kwx', 'onair', 'solitaire'])
    // Grid first, index after, so the numbering and the write-ups' previous/next read in one order.
    const firstIndexed = projects.findIndex((p) => !p.selected)
    expect(projects.slice(firstIndexed).every((p) => !p.selected)).toBe(true)
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
    expect(projects.filter((p) => p.screenshot).map((p) => p.slug)).toEqual(['pfc', 'beacon', 'ccc', 'onair', 'solitaire', 'aglow', 'shed', 'bjs'])
    for (const p of projects) expect(!!p.screenshot !== !!p.figure, p.slug).toBe(true)
  })
  it('keeps each card to one or two sentences', () => {
    for (const p of projects) expect(p.description.length, p.slug).toBeLessThanOrEqual(140)
  })
  it('never uses projection language', () => {
    for (const p of projects) expect(p.description).not.toMatch(/projected|estimated|targeting/i)
  })
})
