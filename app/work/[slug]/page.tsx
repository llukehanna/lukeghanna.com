import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Rail, type RailNavItem } from '@/components/Rail'
import { ArticleSidebar } from '@/components/ArticleSidebar'
import { extractToc } from '@/lib/toc'
import { isWorkSlug, loadWork, readWorkSource, workSlugs } from '@/lib/work'
import { siteName } from '@/lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  return workSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!isWorkSlug(slug)) return {}
  const { meta } = await loadWork(slug)
  return { title: meta.title, description: meta.line, openGraph: { title: `${meta.title} · ${siteName}`, description: meta.line } }
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isWorkSlug(slug)) notFound()

  const { default: Post, meta } = await loadWork(slug)
  const contents: RailNavItem[] = extractToc(readWorkSource(slug)).map((h, i) => ({
    id: h.id,
    label: h.text,
    index: String(i + 1).padStart(2, '0'),
  }))

  return (
    <>
      <Rail
        variant="article"
        title={meta.title}
        line={meta.line}
        meta={[
          { label: 'Status', value: meta.status },
          { label: 'Role', value: meta.role },
          { label: 'Stack', value: meta.stack },
          { label: 'Source', value: meta.source },
        ]}
        links={meta.links}
        contents={contents}
      />
      <main className="px-6 pb-20 pt-12 lg:pl-[400px] lg:pr-12">
        <div className="grid gap-14 xl:grid-cols-[minmax(0,720px)_280px]">
          <article data-testid="article" className="prose-none [&>p:first-of-type]:mb-7 [&>p:first-of-type]:text-[22px] [&>p:first-of-type]:leading-[1.45] [&>p:first-of-type]:tracking-[-0.01em] [&>p:first-of-type]:text-ink">
            <Post />
          </article>
          <ArticleSidebar contents={contents} glance={meta.glance} />
        </div>
      </main>
    </>
  )
}
