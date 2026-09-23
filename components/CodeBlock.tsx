'use client'

import { useRef, type ComponentProps } from 'react'
import { useOverflowFocus } from '@/components/useOverflowFocus'

export function CodeBlock(props: ComponentProps<'pre'>) {
  const ref = useRef<HTMLPreElement>(null)
  const tabIndex = useOverflowFocus(ref)
  return (
    <pre
      ref={ref}
      tabIndex={tabIndex}
      className="glass my-5 overflow-x-auto rounded-[12px] p-5 font-mono text-[13px] leading-[1.65] text-ink"
      {...props}
    />
  )
}
