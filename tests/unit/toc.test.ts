import { describe, it, expect } from 'vitest'
import { extractToc } from '@/lib/toc'

const src = `export const meta = { title: 'X' }

# Not included

## What it does

text

### Sub heading ignored

## Why these markets

\`\`\`
## not a heading, inside a code fence
\`\`\`

## Math & sizing
`

describe('extractToc', () => {
  it('collects only h2 headings, skipping code fences, with github slugs', () => {
    expect(extractToc(src)).toEqual([
      { id: 'what-it-does', text: 'What it does' },
      { id: 'why-these-markets', text: 'Why these markets' },
      { id: 'math--sizing', text: 'Math & sizing' },
    ])
  })
  it('returns an empty list when there are no h2s', () => {
    expect(extractToc('# only h1\n\ntext')).toEqual([])
  })
})
