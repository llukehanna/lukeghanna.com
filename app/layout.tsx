import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-bg text-ink font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
