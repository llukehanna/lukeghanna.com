import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Spotlight } from '@/components/Spotlight'
import { siteName, siteDescription, siteUrl, siteTagline } from '@/lib/site'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s · ${siteName}` },
  description: siteDescription,
  openGraph: { title: siteName, description: siteTagline, url: siteUrl, siteName, type: 'website' },
  twitter: { card: 'summary_large_image', title: siteName, description: siteTagline },
}

// Browser chrome matches the page in either theme; viewport-fit lets the glass rail run into
// the safe area on notched phones.
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#131110' },
    { media: '(prefers-color-scheme: light)', color: '#e9e6e0' },
  ],
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-bg text-ink font-sans">
        <ThemeProvider>
          <Spotlight />
          <div className="relative z-10">{children}</div>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
