import type { MetadataRoute } from 'next'
import { siteName, siteTagline } from '@/lib/site'

// "Add to Home Screen" on a phone gets the monogram, the site's colours, and a standalone window.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: 'LH',
    description: siteTagline,
    start_url: '/',
    display: 'standalone',
    background_color: '#131110',
    theme_color: '#131110',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
