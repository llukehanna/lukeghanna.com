import Link from 'next/link'
import { ViewTransition } from 'react'
import { RailSpecular } from '@/components/RailSpecular'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SectionNav } from '@/components/SectionNav'
import { LocalTime } from '@/components/LocalTime'
import { Mark } from '@/components/Mark'
import { ArticleBar } from '@/components/ArticleBar'
import { links, location, siteName, siteTagline, siteBio } from '@/lib/site'

export type RailNavItem = { id: string; label: string; index: string; children?: { id: string; label: string; live: boolean }[] }
export type RailLink = { label: string; handle: string; href: string }
export type RailProps =
  | { variant: 'home'; nav: RailNavItem[] }
  | {
      variant: 'article'
      title: string
      line: string
      meta: { label: string; value: string }[]
      app?: { label: string; href: string }
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

// At lg+ the rail is fixed to the viewport, so when its content is taller than the viewport
// (a long write-up title plus contents plus links on a short screen) it scrolls internally
// instead of spilling past the card; the scrollbar itself is hidden (see .scroll-quiet).
const shell =
  'lg:fixed lg:left-6 lg:top-6 lg:bottom-6 lg:w-[340px] lg:overflow-y-auto scroll-quiet flex flex-col px-[34px] pb-7 pt-9 max-lg:m-4 max-lg:mb-0'

// On a phone the home rail is not a card: a plain header (name, one line), with the section bar
// under it and the links at the end of the page.
const homeOnPhone =
  'max-md:m-0! max-md:rounded-none! max-md:border-transparent! max-md:bg-none! max-md:shadow-none! max-md:[backdrop-filter:none]! max-md:[-webkit-backdrop-filter:none]! max-md:px-5 max-md:pb-5 max-md:pt-6'

export function Rail(props: RailProps) {
  const homeLinks: RailLink[] = [links.github, links.linkedin, links.email]

  return (
    <>
      <ViewTransition name="rail">
        <RailSpecular data-testid="rail" className={`${shell} ${props.variant === 'home' ? homeOnPhone : ''}`}>
          <div className="absolute right-[18px] top-[18px]">
            <ThemeToggle />
          </div>

          {props.variant === 'home' ? (
            <>
              <Mark size={30} className="mt-[2px] text-ink max-md:hidden" />
              <h1 className="mt-[22px] text-[46px] font-semibold leading-[0.95] tracking-[-0.045em] max-md:mt-0 max-md:text-[30px]">{siteName}</h1>
              <p className="mt-[14px] text-[16px] font-medium leading-[1.4] tracking-[-0.01em] max-md:mt-3 max-md:text-[15px]">{siteTagline}</p>
              <p className="mt-2 text-[14px] leading-[1.55] text-mute">{siteBio}</p>
              <div className="max-md:hidden">
                <SectionNav items={props.nav} layout="vertical" />
              </div>
            </>
          ) : (
            <>
              <Link href="/#projects" className="text-[12px] font-medium uppercase tracking-[0.1em] text-dim hover:text-ink">
                ← Projects
              </Link>
              <h1 className="mt-[26px] text-[42px] font-semibold leading-none tracking-[-0.045em]">{props.title}</h1>
              <p className="mt-[14px] text-[16px] leading-[1.4] text-mute">{props.line}</p>
              {props.app && (
                <a
                  href={props.app.href}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="open-app"
                  className="mt-5 inline-flex items-center gap-2 self-start rounded-full border border-line bg-[var(--card)] px-4 py-[8px] text-[13px] font-medium text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  Open {props.app.label}
                  <span aria-hidden>↗</span>
                </a>
              )}
              <dl className="mt-7 grid gap-3 max-md:grid-cols-2 max-md:gap-x-4">
                {props.meta.map((m) => (
                  <div key={m.label}>
                    <dt className="label">{m.label}</dt>
                    <dd className="mt-[5px] text-[13px] font-medium leading-[1.4]">{m.value}</dd>
                  </div>
                ))}
              </dl>
              {/* At xl the article's sidebar carries the contents; the rail lists them only between md and xl. */}
              <div className="max-md:hidden xl:hidden">
                <SectionNav items={props.contents} />
              </div>
            </>
          )}

          <div className={`mt-auto pt-6 ${props.variant === 'home' ? 'max-md:hidden' : ''}`}>
            <div className="max-md:hidden">
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
      {props.variant === 'home' ? <SectionNav items={props.nav} layout="bar" /> : <ArticleBar items={props.contents} />}
    </>
  )
}
