import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@/content/projects'
import { links } from '@/lib/site'
import { StatusDot } from '@/components/StatusDot'

// The card's media slot. A real capture when there is one; otherwise one true figure from the
// write-up, set as type, never a stand-in picture of an app.
function Media({ p }: { p: Project }) {
  if (p.screenshot?.phone) {
    return (
      <div className="figure-slot relative aspect-[16/9] overflow-hidden rounded-[14px] border border-line">
        <Image
          src={p.screenshot.src}
          alt={`${p.title}, running`}
          width={p.screenshot.width}
          height={p.screenshot.height}
          sizes="200px"
          className="absolute left-1/2 top-[9%] w-[34%] -translate-x-1/2 rounded-[18px] border border-line shadow-[var(--media-shadow)] transition-transform duration-500 ease-[var(--ease)] group-hover:-translate-y-[6px]"
        />
      </div>
    )
  }
  if (p.screenshot) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden rounded-[14px] border border-line bg-[#0d0d0f]">
        <Image
          src={p.screenshot.src}
          alt={`${p.title}, running`}
          fill
          sizes="(min-width: 1024px) 480px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-[var(--ease)] group-hover:scale-[1.015]"
          style={{ objectPosition: p.screenshot.position ?? '0 0' }}
        />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-black/40" />
      </div>
    )
  }
  return (
    <div className="figure-slot relative flex aspect-[16/9] flex-col justify-end overflow-hidden rounded-[14px] border border-line p-6">
      <span className="font-mono text-[44px] font-medium leading-none tracking-[-0.04em] text-ink tabular-nums">{p.figure?.value}</span>
      <span className="label mt-3">{p.figure?.label}</span>
    </div>
  )
}

function Card({ p, index }: { p: Project; index: number }) {
  return (
    <Link
      href={p.href}
      id={p.slug}
      data-testid={`project-${p.slug}`}
      className="card group relative flex scroll-mt-[calc(var(--nav-bar-h)+16px)] flex-col rounded-[20px] p-[6px] md:scroll-mt-6"
    >
      <span aria-hidden className="card-edge" />
      <Media p={p} />
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-[18px] max-md:px-3 max-md:pb-3">
        <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-dim">
          <StatusDot live={p.live} />
          <span className={p.live ? 'text-accent' : 'text-mute'}>{p.statusLabel}</span>
          <span className="truncate">· {p.where}</span>
          <span className="ml-auto tracking-normal">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <h3 className="text-[21px] font-semibold leading-[1.2] tracking-[-0.025em] text-ink transition-colors duration-200 group-hover:text-accent max-md:text-[19px]">
          {p.title}
        </h3>
        <p className="text-[14.5px] leading-[1.55] text-mute max-md:text-[14px]">{p.description}</p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-[6px]">
          <span className="font-mono text-[11px] tracking-[0.02em] text-dim">{p.stack}</span>
          <span aria-hidden className="text-dim transition-[transform,color] duration-200 ease-[var(--ease)] group-hover:-translate-y-[3px] group-hover:translate-x-[3px] group-hover:text-accent">
            →
          </span>
        </div>
      </div>
    </Link>
  )
}

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1 max-md:gap-4">
      {projects.map((p, i) => (
        <Card key={p.slug} p={p} index={i} />
      ))}
      {projects.length % 2 === 1 && (
        <a
          href={links.github.href}
          target="_blank"
          rel="noreferrer"
          data-testid="project-more"
          className="group flex flex-col justify-end gap-[10px] rounded-[20px] border border-line p-7 transition-colors duration-200 hover:border-[var(--glass-line)] max-md:hidden"
        >
          <span className="label">Everything else</span>
          <span className="text-[21px] font-semibold leading-[1.2] tracking-[-0.025em] text-ink">Smaller experiments live on GitHub</span>
          <span className="flex items-center justify-between font-mono text-[11px] tracking-[0.02em] text-dim">
            github.com/{links.github.handle}
            <span aria-hidden className="transition-colors group-hover:text-accent">↗</span>
          </span>
        </a>
      )}
    </div>
  )
}
