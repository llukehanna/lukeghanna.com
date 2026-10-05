import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  // Fully static: `next build` writes plain files to out/, which Cloudflare Workers serves as static assets.
  output: 'export',
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  // Screenshots in public/ are pre-sized WebP (≤1600px wide), so serve them as-is. A static export
  // has no image optimizer anyway.
  images: { unoptimized: true },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: ['rehype-slug'],
  },
})

export default withMDX(nextConfig)
