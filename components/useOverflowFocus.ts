'use client'

import { useEffect, useState, type RefObject } from 'react'

// A scrollable region must be keyboard-reachable (WCAG 2.1.1), but a box that fits its
// container has nothing to scroll and should not be a tab stop. Returns the tabIndex to
// apply: 0 only while the element actually overflows horizontally, re-measured on resize.
export function useOverflowFocus(ref: RefObject<HTMLElement | null>): 0 | undefined {
  const [overflows, setOverflows] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setOverflows(el.scrollWidth > el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return overflows ? 0 : undefined
}
