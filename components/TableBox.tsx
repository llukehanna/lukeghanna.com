'use client'

import { useRef, type ComponentProps } from 'react'
import { useOverflowFocus } from '@/components/useOverflowFocus'

// Markdown tables render inside a horizontally scrollable box so a wide results table never
// widens the page on a phone. Focusable only when it actually scrolls.
export function TableBox(props: ComponentProps<'table'>) {
  const ref = useRef<HTMLDivElement>(null)
  const tabIndex = useOverflowFocus(ref)
  return (
    <div ref={ref} tabIndex={tabIndex} className="my-5 overflow-x-auto rounded-[12px] border border-line">
      <table className="w-full border-collapse text-[13.5px] leading-[1.45]" {...props} />
    </div>
  )
}
