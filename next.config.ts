import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  // Screenshots in public/ are pre-sized WebP (≤1600px wide), so serve them as-is rather than
  // spending the Hobby team's shared 5,000/month image transformations on them.
  images: { unoptimized: true },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: ['rehype-slug'],
  },
})

export default withMDX(nextConfig)
