'use client'

import { useSyncExternalStore } from 'react'
import { location } from '@/lib/site'

function format(d: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: location.timeZone,
    timeZoneName: 'short',
  }).format(d)
}

function subscribe(callback: () => void) {
  const id = setInterval(callback, 30_000)
  return () => clearInterval(id)
}

function getSnapshot() {
  return format(new Date())
}

function getServerSnapshot() {
  return ''
}

export function LocalTime() {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return <span suppressHydrationWarning>{now}</span>
}
