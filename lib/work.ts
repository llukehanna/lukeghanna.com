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
  /** Where the running thing lives, when there is one: rendered as the rail's "Open" link. */
  app?: { label: string; href: string }
  links: { label: string; handle: string; href: string }[]
  glance: { label: string; value: string }[]
}

export const workSlugs = ['pfc', 'beacon', 'ccc', 'kwx', 'onair', 'shed', 'bjs'] as const
export type WorkSlug = (typeof workSlugs)[number]

export function isWorkSlug(s: string): s is WorkSlug {
  return (workSlugs as readonly string[]).includes(s)
}

export function readWorkSource(slug: WorkSlug): string {
  return readFileSync(path.join(process.cwd(), 'content', 'work', `${slug}.mdx`), 'utf8')
}

const loaders = {
  pfc: () => import('@/content/work/pfc.mdx'),
  beacon: () => import('@/content/work/beacon.mdx'),
  ccc: () => import('@/content/work/ccc.mdx'),
  kwx: () => import('@/content/work/kwx.mdx'),
  onair: () => import('@/content/work/onair.mdx'),
  shed: () => import('@/content/work/shed.mdx'),
  bjs: () => import('@/content/work/bjs.mdx'),
} satisfies Record<WorkSlug, () => Promise<{ default: ComponentType; meta: WorkMeta }>>

export function loadWork(slug: WorkSlug) {
  return loaders[slug]()
}
