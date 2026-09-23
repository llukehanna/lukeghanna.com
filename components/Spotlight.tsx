'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { isHoverCapable, prefersReducedMotion } from '@/lib/motion'

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const noop = () => () => {}
function getEnabled() {
  return !prefersReducedMotion() && isHoverCapable()
}

export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null)
  const enabled = useSyncExternalStore(noop, getEnabled, () => false)

  useEffect(() => {
    if (!enabled) return
    let frame = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const el = ref.current
        if (!el) return
        el.style.setProperty('--x', `${(e.clientX / window.innerWidth) * 100}%`)
        el.style.setProperty('--y', `${(e.clientY / window.innerHeight) * 100}%`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [enabled])

  return (
    <>
      {enabled && (
        <div
          ref={ref}
          data-testid="spotlight"
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{ background: 'radial-gradient(700px circle at var(--x, 20%) var(--y, 30%), var(--spot), transparent 60%)' }}
        />
      )}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
    </>
  )
}
