export type Project = {
  slug: 'pfc' | 'beacon' | 'ccc' | 'kwx' | 'onair' | 'shed' | 'bjs'
  title: string
  /** One or two words on the project's state: Live, Research, macOS, iOS. */
  statusLabel: string
  /** True when it is running for real right now; the only thing the accent dot means. */
  live: boolean
  /** Where it lives or what state it is in; shown after the status. Describes the project, not the link. */
  where: string
  /** Every card goes to its write-up. The write-up's rail carries the live-site and source links. */
  href: `/work/${Project['slug']}`
  /** One sentence. The write-up carries the depth. */
  description: string
  /** The stack, in mono under the description. */
  stack: string
  /**
   * A capture of the app. `position` is the object-position of the crop; `phone` marks a
   * portrait capture, shown upright on the slot's backdrop instead of cropped.
   */
  screenshot?: { src: string; width: number; height: number; position?: string; phone?: boolean }
  /** For a project with no capture yet: one true figure from its write-up, shown in the media slot. */
  figure?: { value: string; label: string }
}

export const projects: Project[] = [
  {
    slug: 'pfc',
    title: 'Personal Finance Coach',
    statusLabel: 'Live',
    live: true,
    where: 'private, syncing daily',
    href: '/work/pfc',
    description: 'My full financial state in one append-only ledger. Every action is checked against the plan’s gates before it happens.',
    stack: 'TypeScript · SQLite · Claude over MCP',
    // The Today screen with invented accounts and amounts: every real screen shows real balances.
    screenshot: { src: '/work/pfc/today.png', width: 2880, height: 1620 },
  },
  {
    slug: 'beacon',
    title: 'Beacon',
    statusLabel: 'Live',
    live: true,
    where: 'beacon.lukeghanna.com',
    href: '/work/beacon',
    description: 'A deal-sourcing workbench that learns its screening rules from the analysts who reject firms.',
    stack: 'React · Postgres · Claude',
    screenshot: { src: '/shots/beacon.png', width: 2880, height: 1620 },
  },
  {
    slug: 'ccc',
    title: 'Clippers Command Center',
    statusLabel: 'Live',
    live: true,
    where: 'clippers.lukeghanna.com',
    href: '/work/ccc',
    description: 'Live NBA analytics where every claim is verified against source data before it renders, then re-verified nightly.',
    stack: 'Next.js 16 · Neon Postgres · NBA CDN',
    screenshot: { src: '/shots/ccc.png', width: 2880, height: 1620 },
  },
  {
    slug: 'kwx',
    title: 'Kalshi Weather Edge',
    statusLabel: 'Research',
    live: false,
    where: 'demo pending',
    href: '/work/kwx',
    description: 'The market out-predicts the model: 7,440 settled signals, and a calibration gate that never let it trade.',
    stack: 'Python · Kalshi API · Open-Meteo',
    figure: { value: '7,440', label: 'signals settled, zero orders placed' },
  },
  {
    slug: 'onair',
    title: 'OnAir',
    statusLabel: 'macOS',
    live: false,
    where: 'source public',
    href: '/work/onair',
    description: 'A live-stream player that fails over between ranked HLS sources without the picture ever going black.',
    stack: 'Electron · hls.js · Playwright',
    screenshot: { src: '/shots/onair.png', width: 1440, height: 900 },
  },
  {
    slug: 'shed',
    title: 'Shedquarters',
    statusLabel: 'Live',
    live: true,
    where: 'shed.lukeghanna.com',
    href: '/work/shed',
    description: 'Skill ratings for a house beer-die and spikeball league, scored offline-first from a phone at the table.',
    stack: 'Next.js · Postgres · OpenSkill',
    screenshot: { src: '/shots/shed.png', width: 2640, height: 1485 },
  },
  {
    slug: 'bjs',
    title: 'BJS',
    statusLabel: 'iOS',
    live: false,
    where: 'counting next',
    href: '/work/bjs',
    description: 'A native blackjack trainer on a tested Swift package. The strategy trainer is the first screen done.',
    stack: 'Swift 6 · SwiftUI · SwiftData',
    screenshot: { src: '/shots/bjs.png', width: 660, height: 1434, phone: true },
  },
]
