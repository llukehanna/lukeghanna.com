import Link from 'next/link'
import { ViewTransition } from 'react'
import { RailSpecular } from '@/components/RailSpecular'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SectionNav } from '@/components/SectionNav'
import { LocalTime } from '@/components/LocalTime'
import { links, location, siteName, siteTagline, siteBio } from '@/lib/site'

export type RailNavItem = { id: string; label: string; index: string }
export type RailLink = { label: string; handle: string; href: string }
export type RailProps =
  | { variant: 'home'; nav: RailNavItem[] }
  | {
      variant: 'article'
      title: string
      line: string
      meta: { label: string; value: string }[]
      links: RailLink[]
      contents: RailNavItem[]
    }

function LinkRow({ l }: { l: RailLink }) {
  const external = l.href.startsWith('http')
  return (
    <a
      href={l.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="flex items-center justify-between border-t border-line py-[11px] text-[13px] font-medium text-mute transition-colors hover:text-ink"
    >
      {l.label}
      <span className="font-mono text-[11px] text-dim">{l.handle}</span>
    </a>
  )
}

// Below md the rail's contact links collapse to a single horizontal row (labels only,
// handles hidden); at md+ they revert to the stacked LinkRow list below.
function ContactRow({ contactLinks }: { contactLinks: RailLink[] }) {
  return (
    <div className="flex items-center gap-5 border-t border-line py-[11px] md:hidden">
      {contactLinks.map((l) => {
        const external = l.href.startsWith('http')
        return (
          <a
            key={l.href}
            href={l.href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer' : undefined}
            className="text-[13px] font-medium text-mute transition-colors hover:text-ink"
          >
            {l.label}
          </a>
        )
      })}
    </div>
  )
}

// At lg+ the rail is fixed to the viewport, so when its content is taller than the viewport
// (a long write-up title plus contents plus links on a short screen) it scrolls internally
// instead of spilling past the card; the scrollbar itself is hidden (see .scroll-quiet).
const shell =
  'lg:fixed lg:left-6 lg:top-6 lg:bottom-6 lg:w-[340px] lg:overflow-y-auto scroll-quiet flex flex-col px-[34px] pb-7 pt-9 max-lg:m-4 max-lg:mb-0'

export function Rail(props: RailProps) {
  const homeLinks: RailLink[] = [links.github, links.linkedin, links.email]

  return (
    <>
      <ViewTransition name="rail">
        <RailSpecular data-testid="rail" className={shell}>
          <div className="absolute right-[18px] top-[18px]">
            <ThemeToggle />
          </div>

          {props.variant === 'home' ? (
            <>
              <h1 className="mt-[18px] text-[44px] font-bold leading-none tracking-[-0.04em]">{siteName}</h1>
              <p className="mt-[14px] text-[16px] font-medium leading-[1.4]">{siteTagline}</p>
              <p className="mt-[10px] text-[14px] leading-[1.55] text-mute">{siteBio}</p>
              <div className="max-md:hidden">
                <SectionNav items={props.nav} layout="vertical" />
              </div>
            </>
          ) : (
            <>
              <Link href="/#work" className="text-[12px] font-medium uppercase tracking-[0.1em] text-dim hover:text-ink">
                ← Work
              </Link>
              <h1 className="mt-[26px] text-[40px] font-bold leading-none tracking-[-0.04em]">{props.title}</h1>
              <p className="mt-[14px] text-[16px] leading-[1.4] text-mute">{props.line}</p>
              <dl className="mt-7 grid gap-3">
                {props.meta.map((m) => (
                  <div key={m.label}>
                    <dt className="label">{m.label}</dt>
                    <dd className="mt-[5px] text-[13px] font-medium leading-[1.4]">{m.value}</dd>
                  </div>
                ))}
              </dl>
              <SectionNav items={props.contents} />
            </>
          )}

          <div className="mt-auto pt-6">
            {props.variant === 'home' && <ContactRow contactLinks={homeLinks} />}
            <div className={props.variant === 'home' ? 'max-md:hidden' : ''}>
              {(props.variant === 'home' ? homeLinks : props.links).map((l) => (
                <LinkRow key={l.href} l={l} />
              ))}
            </div>
            <div className="mt-[14px] flex justify-between font-mono text-[11px] tracking-[0.04em] text-dim">
              <span>{location.city}</span>
              <LocalTime />
            </div>
          </div>
        </RailSpecular>
      </ViewTransition>
      {props.variant === 'home' && <SectionNav items={props.nav} layout="bar" />}
    </>
  )
}
