import { Glass } from '@/components/Glass'

export type GlanceRow = { label: string; value: string }

// The small key-value table for a write-up: in the sticky sidebar at xl+, and inline after the
// article below that, so a phone reader still gets it.
export function Glance({ rows, className = '' }: { rows: GlanceRow[]; className?: string }) {
  return (
    <Glass className={`rounded-[14px] p-4 ${className}`}>
      <div className="label mb-3">At a glance</div>
      <dl>
        {rows.map((g) => (
          <div key={g.label} className="flex justify-between gap-4 border-t border-line py-2 text-[13px] text-mute">
            <dt>{g.label}</dt>
            <dd className="text-right font-mono text-[12px] font-medium text-ink">{g.value}</dd>
          </div>
        ))}
      </dl>
    </Glass>
  )
}
