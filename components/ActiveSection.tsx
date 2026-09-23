'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { RailNavItem } from '@/components/Rail'

const ActiveSectionContext = createContext<string | undefined>(undefined)

// One IntersectionObserver per page. Every SectionNav on the page (the rail's vertical list,
// the mobile bar, the article sidebar) reads the same active id from this context instead of
// each running its own observer over the same sections.
export function ActiveSectionProvider({ items, children }: { items: RailNavItem[]; children: ReactNode }) {
  const [active, setActive] = useState(items[0]?.id)
  const activeRef = useRef(active)

  useEffect(() => {
    activeRef.current = active
  })

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el)
    const visible = new Map<string, number>()
    // A short final section can be outscored by a taller earlier section that still spans
    // the observer's band once the page has scrolled as far as it goes, so once the user
    // has reached the bottom of the page the last item wins regardless of ratio.
    const last = items[items.length - 1]
    // Only the last item can win on "at bottom" grounds when the document actually scrolls;
    // on a short page (nothing to scroll) this must never short-circuit the ratio comparison.
    const isAtBottom = () =>
      document.documentElement.scrollHeight > window.innerHeight &&
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
        if (last && isAtBottom()) {
          setActive(last.id)
          return
        }
        let best = activeRef.current
        let bestRatio = 0
        for (const [id, r] of visible) if (r > bestRatio) { best = id; bestRatio = r }
        if (bestRatio > 0 && best) setActive(best)
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    )
    sections.forEach((s) => io.observe(s))

    const onScroll = () => {
      if (last && isAtBottom()) setActive(last.id)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [items])

  return <ActiveSectionContext.Provider value={active}>{children}</ActiveSectionContext.Provider>
}

export function useActiveSection() {
  return useContext(ActiveSectionContext)
}
