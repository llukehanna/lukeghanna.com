declare module '*.mdx' {
  import type { ComponentType } from 'react'
  export const meta: import('@/lib/work').WorkMeta
  const MDXContent: ComponentType<Record<string, unknown>>
  export default MDXContent
}
