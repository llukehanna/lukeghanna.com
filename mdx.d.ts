declare module '*.mdx' {
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
  export const meta: WorkMeta
  const MDXContent: ComponentType<Record<string, unknown>>
  export default MDXContent
}
