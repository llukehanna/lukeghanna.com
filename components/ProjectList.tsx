'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, type MouseEvent } from 'react'
import type { Project } from '@/content/projects'
import { Tag } from '@/components/Tag'

function RowBody({ p, index, open, pos }: { p: Project; index: number; open: boolean; pos: { x: number; y: number } }) {
  return (
    <>
      <span className="font-mono text-[12px] text-dim">{String(index + 1).padStart(2, '0')}</span>
      <div>
        <div className="text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink transition-colors group-hover:text-accent">{p.title}</div>
        <div className="mt-[6px] font-mono text-[10.5px] uppercase tracking-[0.08em] text-accent">
          {p.statusLabel} · {p.hrefLabel}
        </div>
      </div>
      <p className="text-[14.5px] leading-[1.55] text-mute">{p.description}</p>
      <div className="flex flex-wrap justify-end gap-[6px] max-md:justify-start">
        {p.tags.map((t) => <Tag key={t}>{t}</Tag>)}
      </div>
      <span aria-hidden className="text-right text-[16px] text-dim transition-transform group-hover:-translate-y-[3px] group-hover:translate-x-[3px] group-hover:text-accent">↗</span>

      {p.screenshot && (
        <div
          data-testid={`reveal-${p.slug}`}
          data-open={open ? 'true' : 'false'}
          aria-hidden
          className={`glass pointer-events-none absolute z-20 w-[340px] overflow-hidden rounded-[14px] p-2 transition-[opacity,transform] duration-300 ease-out max-md:hidden ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          style={{ left: pos.x, top: pos.y }}
        >
          <Image src={p.screenshot.src} alt="" width={p.screenshot.width} height={p.screenshot.height} className="rounded-[8px]" sizes="340px" />
        </div>
      )}
    </>
  )
}

function Row({ p, index, dimmed, onEnter, onLeave }: { p: Project; index: number; dimmed: boolean; onEnter: () => void; onLeave: () => void }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLAnchorElement>(null)
  const external = p.href.startsWith('http')

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    setPos({ x: Math.min(e.clientX - r.left + 24, r.width - 340), y: e.clientY - r.top - 120 })
  }

  const handleEnter = () => {
    setOpen(true)
    onEnter()
  }
  const handleLeave = () => {
    setOpen(false)
    onLeave()
  }

  const className = `group relative -mx-[22px] grid grid-cols-[48px_1.1fr_1.6fr_auto_40px] items-center gap-6 rounded-[14px] border border-transparent px-[22px] py-[26px] transition-[opacity,background,border-color,box-shadow] duration-300 ease-out hover:glass max-md:grid-cols-1 max-md:gap-3 ${dimmed ? 'opacity-50' : 'opacity-100'}`

  if (external) {
    return (
      <a
        ref={ref}
        href={p.href}
        target="_blank"
        rel="noreferrer"
        data-testid={`project-${p.slug}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onMouseMove={p.screenshot ? onMove : undefined}
        className={className}
      >
        <RowBody p={p} index={index} open={open} pos={pos} />
      </a>
    )
  }

  return (
    <Link
      ref={ref}
      href={p.href}
      data-testid={`project-${p.slug}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={p.screenshot ? onMove : undefined}
      className={className}
    >
      <RowBody p={p} index={index} open={open} pos={pos} />
    </Link>
  )
}

export function ProjectList({ projects }: { projects: Project[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <div className="flex flex-col">
      {projects.map((p, i) => (
        <div key={p.slug} className={i > 0 ? 'border-t border-line' : ''}>
          <Row p={p} index={i} dimmed={hovered !== null && hovered !== p.slug} onEnter={() => setHovered(p.slug)} onLeave={() => setHovered(null)} />
        </div>
      ))}
    </div>
  )
}
