'use client'

import { useEffect, useRef, useState, type ComponentProps } from 'react'

// A scrollable region must be keyboard-reachable (WCAG 2.1.1), but a block that fits its
// container has nothing to scroll and should not be a tab stop. Focusability therefore follows
// actual overflow, re-measured whenever the block's size changes.
export function CodeBlock(props: ComponentProps<'pre'>) {
  const ref = useRef<HTMLPreElement>(null)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setOverflows(el.scrollWidth > el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <pre
      ref={ref}
      tabIndex={overflows ? 0 : undefined}
      className="glass my-5 overflow-x-auto rounded-[12px] p-5 font-mono text-[13px] leading-[1.65] text-ink"
      {...props}
    />
  )
}
