import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { tokens } from '@/lib/tokens'
import { contrastRatio } from '@/lib/contrast'

const AA = 4.5

describe('theme tokens', () => {
  for (const theme of ['dark', 'light'] as const) {
    const t = tokens[theme]
    for (const bg of [t.bg, t.bg2]) {
      for (const [name, fg] of [['ink', t.ink], ['mute', t.mute], ['dim', t.dim], ['accent', t.accent]] as const) {
        it(`${theme}: ${name} on ${bg} is at least ${AA}:1`, () => {
          expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(AA)
        })
      }
    }
  }

  it('globals.css mirrors every hex token', () => {
    const css = readFileSync('app/globals.css', 'utf8').toLowerCase()
    for (const theme of ['dark', 'light'] as const) {
      for (const [k, v] of Object.entries(tokens[theme])) {
        if (v.startsWith('#')) expect(css, `${theme}.${k} ${v} missing from globals.css`).toContain(v.toLowerCase())
      }
    }
  })
})
