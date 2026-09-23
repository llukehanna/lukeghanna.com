'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { isHoverCapable, prefersReducedMotion } from '@/lib/motion'

export function RailSpecular({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (prefersReducedMotion() || !isHoverCapable()) return
    const el = ref.current
    if (!el) return
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--rx', `${((e.clientX - r.left) / r.width) * 100}%`)
      el.style.setProperty('--ry', `${((e.clientY - r.top) / r.height) * 100}%`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[16px]"
        style={{ background: 'radial-gradient(320px circle at var(--rx, 20%) var(--ry, 10%), rgba(255,255,255,0.09), transparent 60%)' }}
      />
      {children}
    </div>
  )
}
