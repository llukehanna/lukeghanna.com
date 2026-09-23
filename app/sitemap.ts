import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'
import { workSlugs } from '@/lib/work'

// No lastModified: the only value available at build time is the build date, which would
// mark every URL as changed on every deploy. A lastmod that is not the real modification
// date is worse than none, so it is omitted rather than faked.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: 'monthly', priority: 1 },
    ...workSlugs.map((slug) => ({ url: `${siteUrl}/work/${slug}`, changeFrequency: 'yearly' as const, priority: 0.7 })),
  ]
}
