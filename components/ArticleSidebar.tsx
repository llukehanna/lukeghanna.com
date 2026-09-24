import { Glass } from '@/components/Glass'
import { Glance, type GlanceRow } from '@/components/Glance'
import { SectionNav } from '@/components/SectionNav'
import type { RailNavItem } from '@/components/Rail'

export function ArticleSidebar({ contents, glance }: { contents: RailNavItem[]; glance: GlanceRow[] }) {
  return (
    <aside className="sticky top-6 hidden self-start xl:grid xl:gap-[14px]">
      <Glass className="rounded-[14px] p-4">
        <div className="label mb-2">Contents</div>
        <SectionNav items={contents} />
      </Glass>
      <Glance rows={glance} />
    </aside>
  )
}
