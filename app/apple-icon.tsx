import { ImageResponse } from 'next/og'
import { MARK_PATH, MARK_TRANSFORM, MARK_VIEWBOX } from '@/components/Mark'
import { tokens } from '@/lib/tokens'

// Home-screen icon: the monogram on the dark charcoal, since iOS squares the corners itself.
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: tokens.dark.bg }}>
        <svg width="132" height="132" viewBox={MARK_VIEWBOX}>
          <path fill={tokens.dark.ink} transform={MARK_TRANSFORM} d={MARK_PATH} />
        </svg>
      </div>
    ),
    size,
  )
}
