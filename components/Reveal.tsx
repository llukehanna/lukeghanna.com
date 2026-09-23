'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

// Fades a figure in as it scrolls into view. Nothing is hidden without JavaScript, and an
// element already on screen at mount is left alone, so the first figure never flashes; under
// reduced motion the effect does nothing at all.
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    if (el.getBoundingClientRect().top < window.innerHeight) return
    el.dataset.reveal = 'pending'
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.dataset.reveal = 'in'
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  )
}
