import { ImageResponse } from 'next/og'
import { siteName, siteTagline } from '@/lib/site'
import { tokens } from '@/lib/tokens'

export const alt = `${siteName}: ${siteTagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 72, background: tokens.dark.bg, color: tokens.dark.ink, fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>{siteName}</div>
        <div style={{ marginTop: 24, fontSize: 34, color: tokens.dark.mute }}>{siteTagline}</div>
        <div style={{ marginTop: 48, fontSize: 22, color: tokens.dark.accent, letterSpacing: 2 }}>LUKEGHANNA.COM</div>
      </div>
    ),
    size,
  )
}
