'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

const noop = () => () => {}
const getMounted = () => true
const getServerMounted = () => false

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(noop, getMounted, getServerMounted)
  const current = mounted ? resolvedTheme : undefined

  const btn = (name: 'dark' | 'light', glyph: string, label: string) => (
    <button
      type="button"
      data-testid={`theme-${name}`}
      aria-label={label}
      aria-pressed={current === name}
      onClick={() => setTheme(name)}
      className={`h-[26px] w-[30px] rounded-full text-[13px] transition-colors ${
        current === name ? 'bg-ink text-bg' : 'text-dim hover:text-ink'
      }`}
    >
      {glyph}
    </button>
  )

  return (
    <div className="flex gap-[2px] rounded-full border border-line bg-[var(--card)] p-[3px]" role="group" aria-label="Theme">
      {btn('dark', '◐', 'Dark theme')}
      {btn('light', '○', 'Light theme')}
    </div>
  )
}
