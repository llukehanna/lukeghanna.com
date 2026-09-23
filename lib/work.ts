import { readFileSync } from 'node:fs'
import path from 'node:path'

export const workSlugs = ['bt'] as const
export type WorkSlug = (typeof workSlugs)[number]

export function isWorkSlug(s: string): s is WorkSlug {
  return (workSlugs as readonly string[]).includes(s)
}

export function readWorkSource(slug: WorkSlug): string {
  return readFileSync(path.join(process.cwd(), 'content', 'work', `${slug}.mdx`), 'utf8')
}
