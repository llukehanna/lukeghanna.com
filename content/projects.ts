export type ProjectStatus = 'live' | 'running' | 'ios'

export type Project = {
  slug: 'ccc' | 'bt' | 'shed' | 'bjs'
  title: string
  status: ProjectStatus
  statusLabel: string
  href: string
  hrefLabel: string
  description: string
  tags: string[]
  screenshot?: { src: string; width: number; height: number }
  writeup?: string
}

export const projects: Project[] = [
  {
    slug: 'ccc',
    title: 'Clippers Command Center',
    status: 'live',
    statusLabel: 'Live',
    href: 'https://clippers.lukeghanna.com',
    hrefLabel: 'clippers.lukeghanna.com',
    description:
      'Live NBA analytics for Clippers fans. A provable-insights engine verifies every claim against source data before it renders. Next.js 16, Neon Postgres, and a two-pipeline architecture for live and historical data.',
    tags: ['Next.js', 'Postgres', 'NBA CDN'],
  },
  {
    slug: 'bt',
    title: 'BT',
    status: 'running',
    statusLabel: 'Running',
    href: '/work/bt',
    hrefLabel: 'Write-up',
    description:
      'Trading bot for Kalshi weather and sports markets. GFS ensembles and de-vigged consensus odds against contract prices, fractional Kelly sizing, and live trading gated on calibration rather than backtest P&L.',
    tags: ['Python', 'Kalshi API', 'Open-Meteo'],
    writeup: '/work/bt',
  },
  {
    slug: 'shed',
    title: 'Shedquarters',
    status: 'live',
    statusLabel: 'Live',
    href: 'https://shed.lukeghanna.com',
    hrefLabel: 'shed.lukeghanna.com',
    description: 'Beer die rankings for the Shed. Elo ratings, streaks, and a leaderboard nobody agrees with.',
    tags: ['Next.js'],
    screenshot: { src: '/shots/shed.png', width: 1440, height: 900 },
  },
  {
    slug: 'bjs',
    title: 'BJS',
    status: 'ios',
    statusLabel: 'iOS',
    href: 'https://github.com/llukehanna/Blackjack-Strategy',
    hrefLabel: 'github.com/llukehanna/Blackjack-Strategy',
    description:
      'Native iOS blackjack trainer. Rule-aware basic strategy drills, Hi-Lo counting, house-edge calculators, and a full card-counting simulation.',
    tags: ['Swift 6', 'SwiftUI', 'SwiftData'],
  },
]
