import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'
import { workSlugs } from '@/lib/work'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: siteUrl, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...workSlugs.map((slug) => ({ url: `${siteUrl}/work/${slug}`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.7 })),
  ]
}
