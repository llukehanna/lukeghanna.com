import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { ComponentType } from 'react'

export type WorkMeta = {
  title: string
  line: string
  status: string
  role: string
  stack: string
  source: string
  links: { label: string; handle: string; href: string }[]
  glance: { label: string; value: string }[]
}

export const workSlugs = ['ccc', 'bt'] as const
export type WorkSlug = (typeof workSlugs)[number]

export function isWorkSlug(s: string): s is WorkSlug {
  return (workSlugs as readonly string[]).includes(s)
}

export function readWorkSource(slug: WorkSlug): string {
  return readFileSync(path.join(process.cwd(), 'content', 'work', `${slug}.mdx`), 'utf8')
}

const loaders = {
  ccc: () => import('@/content/work/ccc.mdx'),
  bt: () => import('@/content/work/bt.mdx'),
} satisfies Record<WorkSlug, () => Promise<{ default: ComponentType; meta: WorkMeta }>>

export function loadWork(slug: WorkSlug) {
  return loaders[slug]()
}
