export type Project = {
  slug: 'pfc' | 'beacon' | 'ccc' | 'bt' | 'onair' | 'shed' | 'bjs'
  title: string
  /** One or two words on the project's state: Live, In progress, Paused, macOS, iOS. */
  statusLabel: string
  /** Where it lives or what state it is in; shown after the status. Describes the project, not the link. */
  where: string
  /** Every row goes to its write-up. The write-up's rail carries the live-site and source links. */
  href: `/work/${Project['slug']}`
  description: string
  tags: string[]
  /** Only a real capture from the real app. */
  screenshot?: { src: string; width: number; height: number }
}

export const projects: Project[] = [
  {
    slug: 'pfc',
    title: 'Personal Finance Coach',
    statusLabel: 'Live',
    where: 'private, syncing daily',
    href: '/work/pfc',
    description:
      'A single-user personal-finance system that holds the full state of my finances, checks every action against the credit-card plan’s gates before it happens, and ranks every dollar’s next-best use in one queue. Append-only SQLite ledger, a 20-rule opportunity-cost comparator over assumption ranges, Claude as the primary interface over MCP.',
    tags: ['TypeScript', 'SQLite', 'MCP'],
  },
  {
    slug: 'beacon',
    title: 'Beacon',
    statusLabel: 'In progress',
    where: 'porting off Foundry',
    href: '/work/beacon',
    description:
      'Deal-sourcing workbench for boutique advisory targets: mandates become searches, an enrichment agent fills in facts from ranked sources and abstains when they conflict, analysts qualify or reject, and rejection rationales cluster into proposed screening rules. Built on Foundry as my Palantir fellowship capstone; now being ported to Postgres and React.',
    tags: ['React', 'Postgres', 'Foundry'],
  },
  {
    slug: 'ccc',
    title: 'Clippers Command Center',
    statusLabel: 'Live',
    where: 'clippers.lukeghanna.com',
    href: '/work/ccc',
    description:
      'Live NBA analytics for Clippers fans. A provable-insights engine verifies every claim against source data before it renders. Next.js 16, Neon Postgres, and a two-pipeline architecture for live and historical data.',
    tags: ['Next.js', 'Postgres', 'NBA CDN'],
  },
  {
    slug: 'bt',
    title: 'BT',
    statusLabel: 'Paused',
    where: 'research result',
    href: '/work/bt',
    description:
      'A Kalshi weather bot that ran unattended for four months and settled 7,440 signals to test whether a GFS ensemble beats the market price. It does not: the market out-predicts the model and the calibration gate never let it trade. That was the design working.',
    tags: ['Python', 'Kalshi API', 'Open-Meteo'],
  },
  {
    slug: 'onair',
    title: 'OnAir',
    statusLabel: 'macOS',
    where: 'unpackaged, source public',
    href: '/work/onair',
    description:
      'A desktop player that keeps a live stream up: candidate HLS streams from pluggable adapters are probed, ranked and played, and when one stalls, errors or goes off-air it fails over to the next without the picture ever going black. Ships no sources; the demo runs against local fixture streams.',
    tags: ['Electron', 'hls.js', 'Playwright'],
    screenshot: { src: '/shots/onair.png', width: 1440, height: 900 },
  },
  {
    slug: 'shed',
    title: 'Shedquarters',
    statusLabel: 'Live',
    where: 'shed.lukeghanna.com',
    href: '/work/shed',
    description:
      'Skill-rating ladder for a house beer-die league, scored from a phone at the table. An offline-first idempotent write queue, OpenSkill ratings replayed from an append-only game history, and a four-digit house PIN made safe by a Postgres-backed rate limiter.',
    tags: ['Next.js', 'Postgres', 'OpenSkill'],
    screenshot: { src: '/shots/shed.png', width: 1440, height: 900 },
  },
  {
    slug: 'bjs',
    title: 'BJS',
    statusLabel: 'iOS',
    where: 'engine done, app in rebuild',
    href: '/work/bjs',
    description:
      'Native iOS blackjack trainer. Rule-aware basic strategy, Hi-Lo counting and a house-edge calculator live in a tested Swift package with no dependencies; the app around it is being rebuilt.',
    tags: ['Swift 6', 'SwiftUI', 'SwiftData'],
  },
]
