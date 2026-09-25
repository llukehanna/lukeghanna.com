'use client'

import type { RailNavItem } from '@/components/Rail'
import { isActive, useActiveSection } from '@/components/ActiveSection'
import { StatusDot } from '@/components/StatusDot'

// Pure renderer. The active id comes from the page's single ActiveSectionProvider, so several
// navs for the same sections (rail list + mobile bar on home, rail + sidebar on an article)
// share one observer.
export function SectionNav({ items, layout = 'vertical' }: { items: RailNavItem[]; layout?: 'vertical' | 'bar' }) {
  const active = useActiveSection()

  if (layout === 'bar') {
    return (
      <nav
        aria-label="Sections (mobile)"
        className="glass sticky top-0 z-20 flex h-[var(--nav-bar-h)] items-stretch justify-around bg-[color-mix(in_srgb,var(--bg)_82%,transparent)]! px-2 md:hidden"
      >
        {items.map((i) => (
          <a
            key={i.id}
            href={`#${i.id}`}
            data-testid={`navbar-${i.id}`}
            aria-current={isActive(i, active) ? 'true' : undefined}
            className={`flex flex-1 items-center justify-center text-[13px] font-medium transition-colors ${isActive(i, active) ? 'text-ink' : 'text-mute hover:text-ink'}`}
          >
            {i.label}
          </a>
        ))}
      </nav>
    )
  }

  return (
    <nav aria-label="Sections" className="mt-9 flex flex-col gap-1">
      {items.map((i) => (
        <div key={i.id}>
          <a
            href={`#${i.id}`}
            data-testid={`nav-${i.id}`}
            aria-current={isActive(i, active) ? 'true' : undefined}
            className={`-mx-3 flex items-center justify-between rounded-[10px] px-3 py-[9px] text-[14px] font-medium transition-colors ${
              isActive(i, active) ? 'bg-[var(--card)] text-ink' : 'text-mute hover:bg-[var(--card)] hover:text-ink'
            }`}
          >
            {i.label}
            <span className="font-mono text-[11px] text-dim">{i.index}</span>
          </a>
          {i.children && (
            <ul className="mb-2 mt-1 border-l border-line pl-3">
              {i.children.map((c) => (
                <li key={c.id}>
                  <a
                    href={`#${c.id}`}
                    data-testid={`nav-${c.id}`}
                    aria-current={active === c.id ? 'true' : undefined}
                    className={`flex items-center gap-[10px] py-[5px] text-[13px] transition-colors ${active === c.id ? 'text-ink' : 'text-dim hover:text-ink'}`}
                  >
                    <StatusDot live={c.live} className={active === c.id && c.live ? 'shadow-[0_0_0_3px_var(--accent-soft)]' : ''} />
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  )
}
