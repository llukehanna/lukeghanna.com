'use client'

import { useEffect, useRef, useState } from 'react'
import type { RailNavItem } from '@/components/Rail'

export function SectionNav({ items }: { items: RailNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id)
  const activeRef = useRef(active)

  useEffect(() => {
    activeRef.current = active
  })

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el)
    const visible = new Map<string, number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
        let best = activeRef.current
        let bestRatio = 0
        for (const [id, r] of visible) if (r > bestRatio) { best = id; bestRatio = r }
        if (bestRatio > 0 && best) setActive(best)
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [items])

  return (
    <nav aria-label="Sections" className="mt-11 flex flex-col gap-1">
      {items.map((i) => (
        <a
          key={i.id}
          href={`#${i.id}`}
          data-testid={`nav-${i.id}`}
          aria-current={active === i.id ? 'true' : undefined}
          className={`-mx-3 flex items-center justify-between rounded-[10px] px-3 py-[10px] text-[14px] font-medium transition-colors ${
            active === i.id ? 'bg-[var(--card)] text-ink' : 'text-mute hover:bg-[var(--card)] hover:text-ink'
          }`}
        >
          {i.label}
          <span className="font-mono text-[11px] text-dim">{i.index}</span>
        </a>
      ))}
    </nav>
  )
}
