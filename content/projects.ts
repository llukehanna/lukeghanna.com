export type Project = {
  slug: 'pfc' | 'beacon' | 'ccc' | 'kwx' | 'onair' | 'solitaire' | 'aglow' | 'shed' | 'bjs'
  title: string
  /** One or two words on the project's state: Live, Research, macOS, iOS. */
  statusLabel: string
  /** True when it is running for real right now; the only thing the accent dot means. */
  live: boolean
  /** Where it lives or what state it is in; shown after the status. Describes the project, not the link. */
  where: string
  /** Every card goes to its write-up. The write-up's rail carries the live-site and source links. */
  href: `/work/${Project['slug']}`
  /**
   * In the six-card grid. The rest sit in the one-line index under it. The grid stays at six: a
   * new project earns a card by replacing the weakest one, which moves down to the index.
   */
  selected: boolean
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
    selected: true,
    where: 'private, syncing daily',
    href: '/work/pfc',
    description: 'My full financial state in one append-only ledger. Every action is checked against the plan’s gates before it happens.',
    stack: 'TypeScript · SQLite · Claude over MCP',
    // The Today screen with invented accounts and amounts: every real screen shows real balances.
    screenshot: { src: '/work/pfc/today.webp', width: 2880, height: 1620 },
  },
  {
    slug: 'beacon',
    title: 'Beacon',
    statusLabel: 'Live',
    live: true,
    selected: true,
    where: 'beacon.lukeghanna.com',
    href: '/work/beacon',
    description: 'A deal-sourcing workbench that learns its screening rules from the analysts who reject firms.',
    stack: 'React · Postgres · Claude',
    screenshot: { src: '/shots/beacon.webp', width: 2880, height: 1620 },
  },
  {
    slug: 'ccc',
    title: 'Clippers Command Center',
    statusLabel: 'Live',
    live: true,
    selected: true,
    where: 'clippers.lukeghanna.com',
    href: '/work/ccc',
    description: 'Clippers analytics where every stored insight carries the query that proves it, over six seasons of league-wide box scores.',
    stack: 'Next.js 16 · Neon Postgres · Vercel CDN',
    screenshot: { src: '/shots/ccc-home.webp', width: 2880, height: 1620 },
  },
  {
    slug: 'kwx',
    title: 'Kalshi Weather Edge',
    statusLabel: 'Research',
    live: false,
    selected: true,
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
    selected: true,
    where: 'local build, source public',
    href: '/work/onair',
    description: 'A live-sports player that fails over between ranked HLS streams without the picture ever going black.',
    stack: 'Electron · hls.js · Playwright',
    screenshot: { src: '/shots/onair-home.webp', width: 1440, height: 900 },
  },
  {
    slug: 'solitaire',
    title: 'Solitaire',
    statusLabel: 'Live',
    live: true,
    selected: true,
    where: 'solitaire.lukeghanna.com',
    href: '/work/solitaire',
    description: 'Ad-free Klondike where a solver proves every deal winnable before you see it, then backs the hints and the rewind.',
    stack: 'React · TypeScript · Web Worker solver',
    screenshot: { src: '/work/solitaire/table.webp', width: 2880, height: 1620 },
  },
  {
    slug: 'aglow',
    title: 'Aglow',
    statusLabel: 'Live',
    live: true,
    selected: false,
    where: 'aglow.lukeghanna.com',
    href: '/work/aglow',
    description: 'The Christmas Tree Light Up puzzle with its original rules, rebuilt so every connection sends light flowing through the tree.',
    stack: 'TypeScript · Canvas 2D · Web Audio',
    screenshot: { src: '/work/aglow/fireside.webp', width: 2880, height: 1800 },
  },
  {
    slug: 'shed',
    title: 'Shedquarters',
    statusLabel: 'Live',
    live: true,
    selected: false,
    where: 'die.lukeghanna.com',
    href: '/work/shed',
    description: 'Skill ratings for a house beer-die and spikeball league, scored offline-first from a phone at the table.',
    stack: 'Next.js · Postgres · OpenSkill',
    screenshot: { src: '/shots/shed.webp', width: 2640, height: 1485 },
  },
  {
    slug: 'bjs',
    title: 'BJS',
    statusLabel: 'iOS',
    live: false,
    selected: false,
    where: 'counting next',
    href: '/work/bjs',
    description: 'A native blackjack trainer on a tested Swift package. The strategy trainer is the first screen done.',
    stack: 'Swift 6 · SwiftUI · SwiftData',
    screenshot: { src: '/shots/bjs.webp', width: 660, height: 1434, phone: true },
  },
]
