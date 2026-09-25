'use client'

import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react'
import { Glass } from '@/components/Glass'
import { isHoverCapable, prefersReducedMotion } from '@/lib/motion'

type RailSpecularProps = Omit<ComponentPropsWithoutRef<'aside'>, 'className'> & {
  className?: string
}

export function RailSpecular({ children, className = '', ...rest }: RailSpecularProps) {
  const ref = useRef<HTMLElement>(null)
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
    <Glass as="aside" ref={ref} className={`relative ${className}`} {...rest}>
      <div
        aria-hidden
        data-testid="rail-specular"
        className="pointer-events-none absolute -inset-px rounded-[16px]"
        style={{ background: 'radial-gradient(320px circle at var(--rx, 20%) var(--ry, 10%), rgba(255,255,255,0.09), transparent 60%)' }}
      />
      <span aria-hidden className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-[var(--edge)] to-transparent" />
      {children}
    </Glass>
  )
}
