'use client'

import type { RailNavItem } from '@/components/Rail'
import { useActiveSection } from '@/components/ActiveSection'

// Pure renderer. The active id comes from the page's single ActiveSectionProvider, so several
// navs for the same sections (rail list + mobile bar on home, rail + sidebar on an article)
// share one observer.
export function SectionNav({ items, layout = 'vertical' }: { items: RailNavItem[]; layout?: 'vertical' | 'bar' }) {
  const active = useActiveSection()

  if (layout === 'bar') {
    return (
      <nav
        aria-label="Sections (mobile)"
        className="glass sticky top-0 z-20 flex h-[var(--nav-bar-h)] items-center justify-around px-4 md:hidden"
      >
        {items.map((i) => (
          <a
            key={i.id}
            href={`#${i.id}`}
            data-testid={`navbar-${i.id}`}
            aria-current={active === i.id ? 'true' : undefined}
            className={`text-[13px] font-medium transition-colors ${active === i.id ? 'text-ink' : 'text-mute hover:text-ink'}`}
          >
            {i.label}
          </a>
        ))}
      </nav>
    )
  }

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
