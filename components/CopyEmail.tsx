'use client'

import { useEffect, useState } from 'react'
import { links } from '@/lib/site'

// The address as a button: one click copies it and says so. Without clipboard access (or
// JavaScript) it is still a mailto link.
export function CopyEmail({ className = '' }: { className?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(id)
  }, [copied])

  return (
    <a
      href={links.email.href}
      data-testid="copy-email"
      onClick={async (e) => {
        if (!navigator.clipboard) return
        e.preventDefault()
        try {
          await navigator.clipboard.writeText(links.email.handle)
          setCopied(true)
        } catch {
          window.location.href = links.email.href
        }
      }}
      className={`glass inline-flex h-11 items-center justify-between gap-3 rounded-[12px] pl-4 pr-[6px] font-mono text-[13.5px] text-ink ${className}`}
    >
      {links.email.handle}
      <span
        aria-live="polite"
        className={`inline-flex h-8 items-center rounded-[8px] px-[10px] font-sans text-[12px] font-medium transition-colors duration-200 ${
          copied ? 'bg-accent-soft text-accent' : 'bg-[var(--card)] text-mute'
        }`}
      >
        {copied ? 'Copied' : 'Copy'}
      </span>
    </a>
  )
}
