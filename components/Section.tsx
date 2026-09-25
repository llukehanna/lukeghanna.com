import type { ReactNode } from 'react'

export function Section({ id, title, index, note, children }: { id: string; title: string; index: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-24 max-md:mb-16 scroll-mt-[var(--nav-bar-h)]">
      <div className="mb-[22px] flex items-baseline gap-[14px]">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">{title}</h2>
        <span className="font-mono text-[11px] text-dim">{note ? `${index} · ${note}` : index}</span>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>
      {children}
    </section>
  )
}
