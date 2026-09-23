// The LH monogram: Inter ExtraBold, tracked tight, as a path so it needs no font at runtime.
// Same path as app/icon.svg; keep the two in sync.
export const MARK_VIEWBOX = '0 0 146.9 146.9'
export const MARK_PATH =
  'M53.32 0L5.66 0L5.66-72.75L22.90-72.75L22.90-14.06L53.32-14.06 M72.44 0L55.21 0L55.21-72.75L72.44-72.75L72.44-44.19L101.50-44.19L101.50-72.75L118.68-72.75L118.68 0L101.50 0L101.50-30.13L72.44-30.13'
export const MARK_TRANSFORM = 'translate(11.29 109.84)'

export function Mark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox={MARK_VIEWBOX} aria-hidden className={className}>
      <path fill="currentColor" transform={MARK_TRANSFORM} d={MARK_PATH} />
    </svg>
  )
}
