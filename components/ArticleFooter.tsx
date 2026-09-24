import type { RailLink } from '@/components/Rail'

// Below md the rail hides its link list to get the reader to the article sooner, so the same
// links (source, docs, previous, next) close the article instead.
export function ArticleFooter({ links }: { links: RailLink[] }) {
  if (links.length === 0) return null
  return (
    <nav aria-label="Article links" data-testid="article-footer" className="mt-12 border-t border-line md:hidden">
      {links.map((l) => {
        const external = l.href.startsWith('http')
        return (
          <a
            key={l.href}
            href={l.href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer' : undefined}
            className="flex items-center justify-between border-b border-line py-[13px] text-[14px] font-medium text-mute"
          >
            {l.label}
            <span className="font-mono text-[11px] text-dim">{l.handle}</span>
          </a>
        )
      })}
    </nav>
  )
}
