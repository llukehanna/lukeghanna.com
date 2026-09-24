'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { RailNavItem } from '@/components/Rail'
import { useActiveSection } from '@/components/ActiveSection'

// Phone-width replacement for the rail's contents list on a write-up: a sticky bar with the
// back link, the current section, and a disclosure that lists every section. Below md only;
// at md+ the rail carries the contents.
export function ArticleBar({ items }: { items: RailNavItem[] }) {
  const active = useActiveSection()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = items.find((i) => i.id === active) ?? items[0]

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onDown = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    <div ref={ref} className="sticky top-0 z-20 md:hidden">
      <nav aria-label="Article (mobile)" className="glass flex h-[var(--nav-bar-h)] items-stretch justify-between px-2">
        <Link href="/#work" className="flex items-center px-2 text-[12px] font-medium uppercase tracking-[0.1em] text-dim">
          ← Work
        </Link>
        <button
          type="button"
          data-testid="article-contents"
          aria-expanded={open}
          aria-controls="article-contents-list"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 items-center gap-2 px-2 text-[13px] font-medium text-ink"
        >
          {current && <span className="font-mono text-[11px] text-dim">{current.index}/{String(items.length).padStart(2, '0')}</span>}
          <span className="truncate">{current?.label ?? 'Contents'}</span>
          <span aria-hidden className={`text-dim transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
        </button>
      </nav>
      <ul
        id="article-contents-list"
        hidden={!open}
        className="glass absolute inset-x-0 top-full mx-2 mt-1 rounded-[12px] p-2"
      >
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              data-testid={`navbar-${i.id}`}
              aria-current={active === i.id ? 'true' : undefined}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-[8px] px-3 py-[10px] text-[14px] ${active === i.id ? 'bg-[var(--card)] text-ink' : 'text-mute'}`}
            >
              {i.label}
              <span className="font-mono text-[11px] text-dim">{i.index}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
