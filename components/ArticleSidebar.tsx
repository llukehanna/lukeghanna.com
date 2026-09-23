import { Glass } from '@/components/Glass'
import { SectionNav } from '@/components/SectionNav'
import type { RailNavItem } from '@/components/Rail'

export function ArticleSidebar({ contents, glance }: { contents: RailNavItem[]; glance: { label: string; value: string }[] }) {
  return (
    <aside className="sticky top-6 hidden self-start xl:grid xl:gap-[14px]">
      <Glass className="rounded-[14px] p-4">
        <div className="label mb-2">Contents</div>
        <SectionNav items={contents} />
      </Glass>
      <Glass className="rounded-[14px] p-4">
        <div className="label mb-3">At a glance</div>
        <dl>
          {glance.map((g) => (
            <div key={g.label} className="flex justify-between border-t border-line py-2 text-[13px] text-mute">
              <dt>{g.label}</dt>
              <dd className="font-mono text-[12px] font-medium text-ink">{g.value}</dd>
            </div>
          ))}
        </dl>
      </Glass>
    </aside>
  )
}
