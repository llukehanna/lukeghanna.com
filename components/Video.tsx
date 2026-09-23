'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

// A short, silent screen recording that loops. Under reduced motion it stays on its poster
// with controls, so nothing moves unless the reader asks it to.
export function Video({ src, poster, captions, width, height, label, className = '' }: {
  src: string
  poster: string
  captions: string
  width: number
  height: number
  label: string
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !prefersReducedMotion()) return
    el.autoplay = false
    el.pause()
    el.controls = true
  }, [])
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      width={width}
      height={height}
      muted
      autoPlay
      loop
      playsInline
      preload="metadata"
      aria-label={label}
      className={className}
    >
      <track kind="captions" srcLang="en" label="English" src={captions} default />
    </video>
  )
}
