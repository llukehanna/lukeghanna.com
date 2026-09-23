import Image from 'next/image'
import type { ReactNode } from 'react'
import { Reveal } from '@/components/Reveal'
import { Video } from '@/components/Video'

export function Caption({ n, children, source }: { n: number; children: ReactNode; source?: string }) {
  return (
    <figcaption className="mt-3 text-[13px] leading-[1.5] text-mute">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-dim">Fig. {n}</span>{' '}
      {children}
      {source && <span className="mt-1 block font-mono text-[11px] tracking-[0.02em] text-dim">{source}</span>}
    </figcaption>
  )
}

// A captured image or short video from the real app. `frame` sets how it sits: a phone
// capture is shown at phone width, a desktop capture spans the column.
export function Figure({
  n,
  src,
  poster,
  captions,
  width,
  height,
  alt,
  caption,
  source,
  frame = 'desktop',
}: {
  n: number
  src: string
  poster?: string
  captions?: string
  width: number
  height: number
  alt: string
  caption: string
  source: string
  frame?: 'phone' | 'desktop'
}) {
  const isVideo = src.endsWith('.mp4')
  const media = 'block h-auto w-full rounded-[10px]'
  return (
    <Reveal>
      <figure className="my-7">
        <div className={`glass rounded-[14px] p-2 ${frame === 'phone' ? 'mx-auto w-[300px] max-w-full' : ''}`}>
          {isVideo ? (
            <Video src={src} poster={poster ?? ''} captions={captions ?? ''} width={width} height={height} label={alt} className={media} />
          ) : (
            <Image src={src} alt={alt} width={width} height={height} className={media} sizes={frame === 'phone' ? '300px' : '(min-width: 1280px) 720px, 100vw'} />
          )}
        </div>
        <Caption n={n} source={source}>{caption}</Caption>
      </figure>
    </Reveal>
  )
}
