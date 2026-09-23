# lukeghanna.com Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship lukeghanna.com: a statically generated Next.js site with a glass rail, a four-project list with hover reveal, one MDX project write-up (BT), dark and light themes, and the infrastructure (domain, subdomains, email) around it.

**Architecture:** One Next.js App Router project, every route static. Design tokens live in `lib/tokens.ts` and are mirrored as CSS variables in `app/globals.css` (a test guards the mirror and the contrast ratios). Project data is a typed array in `content/projects.ts`; write-ups are MDX files in `content/work/` that export a `meta` object. Client components are limited to the pieces that need the DOM: theme toggle, spotlight, rail specular, section tracking, project row hover.

**Tech Stack:** Next.js 16.3, React 19.3, TypeScript, Tailwind CSS 4.3, next-themes 0.4, @next/mdx 16.3 + rehype-slug 6, next/font (Inter, Geist Mono), @vercel/analytics 2, @vercel/speed-insights 2, Vitest 5 (unit), Playwright 1.63 + @axe-core/playwright (e2e and accessibility). Node 24.

**Spec:** `docs/superpowers/specs/2026-09-22-personal-site-design.md`

## Global Constraints

- Every route is statically generated; `next build` must report `○ (Static)` for `/` and `/work/bt`. No runtime server code, no database.
- No fabricated content: no invented numbers, illustrative logs, placeholder charts, or "projected" figures anywhere on the site.
- Screenshot reveal only for projects with a `screenshot` field; in v1 only Shedquarters has one.
- Theme tokens (exact, from the spec): dark bg `#131110`, bg-2 `#1a1715`, ink `#f0ebe3`, mute `#a39d94`, dim `#8a847b`, accent `#f2c14e`; light bg `#e9e6e0`, bg-2 `#f3f1ec`, ink `#151412`, mute `#5f5b55`, dim `#6b675f`, accent `#7a5a00`. Every text token on its background is at least 4.5:1.
- Fonts: Inter (UI and prose), Geist Mono (labels, numbers, code), loaded with `next/font/google`.
- Motion: springs and ease-out only, 200 to 500ms; no smooth-scroll library, no cursor follower, no magnetic buttons; everything animated respects `prefers-reduced-motion`.
- Rail width 340px, 24px inset; main content starts at 400px on desktop; radii 16px (rail, cards), 10px (nav items), 999px (tags).
- Repo: `llukehanna/lukeghanna.com`. Vercel project: `lukeghanna-com`, Hobby plan. Domain: lukeghanna.com at Cloudflare, DNS-only mode.
- Commits end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

## File structure

```
app/
  layout.tsx                 fonts, ThemeProvider, Spotlight, analytics
  globals.css                Tailwind import, tokens as CSS vars, dark variant, base styles
  page.tsx                   home: Rail + About + Work + Contact
  work/[slug]/page.tsx       write-up: Rail (article) + MDX + ArticleSidebar
  not-found.tsx              404
  opengraph-image.tsx        generated OG image
  sitemap.ts, robots.ts
components/
  Glass.tsx                  the glass material (server-safe wrapper div)
  Rail.tsx                   home and article variants, wraps RailSpecular
  RailSpecular.tsx           client: cursor-tracked highlight, reduced-motion aware
  ThemeToggle.tsx            client: next-themes
  SectionNav.tsx             client: tracks active section with IntersectionObserver
  Section.tsx                heading row with number and hairline
  ProjectList.tsx            client: rows, sibling dimming, screenshot reveal
  Spotlight.tsx              client: background spotlight + grain
  ArticleSidebar.tsx         contents + at-a-glance
  ThemeProvider.tsx          client wrapper around next-themes
content/
  projects.ts                the four projects
  work/bt.mdx                BT write-up with exported meta
lib/
  tokens.ts                  theme tokens (single source for tests)
  contrast.ts                WCAG contrast ratio
  colophon.ts                build-time "Month YYYY"
  toc.ts                     extract h2 headings from MDX source
  site.ts                    name, url, links
mdx-components.tsx           required by @next/mdx
mdx.d.ts                     types for *.mdx imports
public/shots/shed.png        curated Shedquarters capture
tests/unit/*.test.ts         Vitest
tests/e2e/*.spec.ts          Playwright
docs/INFRA.md                the steps Luke does himself
```

---

### Task 1: Scaffold the project and the test harness

**Files:**
- Create: everything `create-next-app` produces, plus `vitest.config.ts`, `playwright.config.ts`, `tests/unit/smoke.test.ts`, `tests/e2e/smoke.spec.ts`
- Modify: `package.json` (scripts), `.gitignore`

**Interfaces:**
- Produces: `npm run test:unit` (Vitest), `npm run test:e2e` (Playwright against `next dev` on port 3000), `npm run build`, path alias `@/*` → project root.

- [ ] **Step 1: Scaffold into a temp folder and move it up**

`create-next-app` refuses a non-empty directory, and this one already holds `docs/` and `.git`. Scaffold beside it, then move.

```bash
cd "/Users/luke/Claude Projects/Personal Website"
npx --yes create-next-app@latest site --yes --use-npm --disable-git
rsync -a site/ ./ && rm -rf site
ls app components 2>/dev/null; cat package.json | head -30
```

Expected: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs` exist. `package.json` lists `next` 16.x, `react` 19.3.x, `tailwindcss` 4.x. If the scaffold created `AGENTS.md`, keep it.

- [ ] **Step 2: Install the dependencies this plan uses**

```bash
npm i next-themes @next/mdx @mdx-js/loader @mdx-js/react @types/mdx rehype-slug github-slugger @vercel/analytics @vercel/speed-insights
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test @axe-core/playwright
npx playwright install chromium
```

- [ ] **Step 3: Add scripts and the Vitest config**

Add to `package.json` `scripts`:

```json
"test:unit": "vitest run",
"test:unit:watch": "vitest",
"test:e2e": "playwright test",
"typecheck": "tsc --noEmit"
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
  resolve: {
    alias: { '@': path.resolve(__dirname) },
  },
})
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: 0,
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
```

- [ ] **Step 4: Write a failing unit smoke test and a failing e2e smoke test**

`tests/unit/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { siteName } from '@/lib/site'

describe('site config', () => {
  it('exposes the site name', () => {
    expect(siteName).toBe('Luke Hanna')
  })
})
```

`tests/e2e/smoke.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('home renders the name', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Luke Hanna' })).toBeVisible()
})
```

- [ ] **Step 5: Run both to verify they fail**

```bash
npm run test:unit
```
Expected: FAIL, cannot resolve `@/lib/site`.

```bash
npm run test:e2e -- --project=desktop
```
Expected: FAIL, no h1 "Luke Hanna" on the scaffold page.

- [ ] **Step 6: Make them pass with the minimum**

Create `lib/site.ts`:

```ts
export const siteName = 'Luke Hanna'
export const siteUrl = 'https://lukeghanna.com'
export const siteTagline = 'Builds things end-to-end to understand them.'
export const siteDescription =
  'Computer science and business at USC. Corporate development at Houlihan Lokey. Projects, built end-to-end.'
export const links = {
  github: { label: 'GitHub', handle: 'llukehanna', href: 'https://github.com/llukehanna' },
  linkedin: { label: 'LinkedIn', handle: 'lukehanna2', href: 'https://www.linkedin.com/in/lukehanna2' },
  email: { label: 'Email', handle: 'luke@lukeghanna.com', href: 'mailto:luke@lukeghanna.com' },
} as const
export const location = { city: 'Los Angeles', timeZone: 'America/Los_Angeles' } as const
```

Replace `app/page.tsx` with:

```tsx
import { siteName } from '@/lib/site'

export default function Home() {
  return (
    <main>
      <h1>{siteName}</h1>
    </main>
  )
}
```

- [ ] **Step 7: Run both to verify they pass, then build**

```bash
npm run test:unit && npm run test:e2e -- --project=desktop && npm run build
```
Expected: unit PASS, e2e PASS, build succeeds with `/` listed as static.

- [ ] **Step 8: Commit**

Ensure `.gitignore` contains `.superpowers/`, `node_modules/`, `.next/`, `.env*`, `.vercel`, `test-results/`, `playwright-report/`.

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Vitest and Playwright

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Design tokens, contrast guard, and theme provider

**Files:**
- Create: `lib/tokens.ts`, `lib/contrast.ts`, `components/ThemeProvider.tsx`, `tests/unit/tokens.test.ts`, `tests/unit/contrast.test.ts`
- Modify: `app/globals.css`, `app/layout.tsx`

**Interfaces:**
- Produces: `tokens.dark` and `tokens.light` objects with keys `bg, bg2, ink, mute, dim, line, accent, accentSoft`; `contrastRatio(hexA, hexB): number`; CSS variables `--bg --bg2 --ink --mute --dim --line --accent --accent-soft --glass --glass-line --glass-hl --glass-shadow --card` on `:root` (light) and `.dark`; Tailwind color utilities `bg-bg`, `text-ink`, `text-mute`, `text-dim`, `text-accent`, `bg-bg2`, `border-line`, `bg-accent-soft`; `font-sans` = Inter, `font-mono` = Geist Mono.

- [ ] **Step 1: Write the failing contrast test**

`tests/unit/contrast.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { contrastRatio, relativeLuminance } from '@/lib/contrast'

describe('contrast', () => {
  it('computes luminance of white and black', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5)
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5)
  })
  it('white on black is 21:1', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1)
  })
  it('is symmetric', () => {
    expect(contrastRatio('#f2c14e', '#131110')).toBeCloseTo(contrastRatio('#131110', '#f2c14e'), 6)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run tests/unit/contrast.test.ts
```
Expected: FAIL, cannot resolve `@/lib/contrast`.

- [ ] **Step 3: Implement contrast**

`lib/contrast.ts`:

```ts
function channel(v: number): number {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
```

- [ ] **Step 4: Run it to verify it passes**

```bash
npx vitest run tests/unit/contrast.test.ts
```
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing tokens test**

`tests/unit/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { tokens } from '@/lib/tokens'
import { contrastRatio } from '@/lib/contrast'

const AA = 4.5

describe('theme tokens', () => {
  for (const theme of ['dark', 'light'] as const) {
    const t = tokens[theme]
    for (const bg of [t.bg, t.bg2]) {
      for (const [name, fg] of [['ink', t.ink], ['mute', t.mute], ['dim', t.dim], ['accent', t.accent]] as const) {
        it(`${theme}: ${name} on ${bg} is at least ${AA}:1`, () => {
          expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(AA)
        })
      }
    }
  }

  it('globals.css mirrors every hex token', () => {
    const css = readFileSync('app/globals.css', 'utf8').toLowerCase()
    for (const theme of ['dark', 'light'] as const) {
      for (const [k, v] of Object.entries(tokens[theme])) {
        if (v.startsWith('#')) expect(css, `${theme}.${k} ${v} missing from globals.css`).toContain(v.toLowerCase())
      }
    }
  })
})
```

- [ ] **Step 6: Run it to verify it fails**

```bash
npx vitest run tests/unit/tokens.test.ts
```
Expected: FAIL, cannot resolve `@/lib/tokens`.

- [ ] **Step 7: Write tokens and the CSS**

`lib/tokens.ts`:

```ts
export const tokens = {
  dark: {
    bg: '#131110',
    bg2: '#1a1715',
    ink: '#f0ebe3',
    mute: '#a39d94',
    dim: '#8a847b',
    line: 'rgba(255,255,255,0.09)',
    accent: '#f2c14e',
    accentSoft: 'rgba(242,193,78,0.14)',
  },
  light: {
    bg: '#e9e6e0',
    bg2: '#f3f1ec',
    ink: '#151412',
    mute: '#5f5b55',
    dim: '#6b675f',
    line: 'rgba(0,0,0,0.10)',
    accent: '#7a5a00',
    accentSoft: 'rgba(122,90,0,0.14)',
  },
} as const

export type ThemeName = keyof typeof tokens
```

Replace `app/globals.css` entirely:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-bg: var(--bg);
  --color-bg2: var(--bg2);
  --color-ink: var(--ink);
  --color-mute: var(--mute);
  --color-dim: var(--dim);
  --color-line: var(--line);
  --color-accent: var(--accent);
  --color-accent-soft: var(--accent-soft);
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
  --radius-rail: 16px;
  --radius-item: 10px;
}

/* light (stone) */
:root {
  --bg: #e9e6e0;
  --bg2: #f3f1ec;
  --ink: #151412;
  --mute: #5f5b55;
  --dim: #6b675f;
  --line: rgba(0,0,0,0.10);
  --accent: #7a5a00;
  --accent-soft: rgba(122,90,0,0.14);
  --spot: rgba(0,0,0,0.05);
  --glass: linear-gradient(170deg, rgba(255,255,255,0.70), rgba(255,255,255,0.40));
  --glass-line: rgba(0,0,0,0.08);
  --glass-hl: rgba(255,255,255,0.90);
  --glass-shadow: 0 30px 80px rgba(0,0,0,0.12);
  --card: rgba(255,255,255,0.50);
  color-scheme: light;
}

/* dark (warm charcoal) */
.dark {
  --bg: #131110;
  --bg2: #1a1715;
  --ink: #f0ebe3;
  --mute: #a39d94;
  --dim: #8a847b;
  --line: rgba(255,255,255,0.09);
  --accent: #f2c14e;
  --accent-soft: rgba(242,193,78,0.14);
  --spot: rgba(255,220,180,0.07);
  --glass: linear-gradient(170deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02));
  --glass-line: rgba(255,255,255,0.10);
  --glass-hl: rgba(255,255,255,0.14);
  --glass-shadow: 0 30px 80px rgba(0,0,0,0.35);
  --card: rgba(255,255,255,0.03);
  color-scheme: dark;
}

html { background: var(--bg); }
body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* the glass material, used by Glass.tsx and hover states */
.glass {
  background: var(--glass);
  border: 1px solid var(--glass-line);
  box-shadow: inset 0 1px 0 var(--glass-hl), var(--glass-shadow);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
}

/* mono labels */
.label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dim);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

- [ ] **Step 8: Run the tokens test to verify it passes**

```bash
npx vitest run tests/unit/tokens.test.ts
```
Expected: PASS (17 tests: 16 contrast pairs + 1 mirror).

- [ ] **Step 9: Add the theme provider and wire the layout**

`components/ThemeProvider.tsx`:

```tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}
```

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { siteName, siteDescription, siteUrl, siteTagline } from '@/lib/site'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s · ${siteName}` },
  description: siteDescription,
  openGraph: { title: siteName, description: siteTagline, url: siteUrl, siteName, type: 'website' },
  twitter: { card: 'summary_large_image', title: siteName, description: siteTagline },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-bg text-ink font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 10: Verify types, build, and both test suites**

```bash
npm run typecheck && npm run test:unit && npm run build
```
Expected: no type errors, all unit tests pass, build static.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: design tokens with contrast guard and theme provider

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Spotlight background and the Glass primitive

**Files:**
- Create: `components/Spotlight.tsx`, `components/Glass.tsx`, `lib/motion.ts`, `tests/unit/motion.test.ts`, `tests/e2e/spotlight.spec.ts`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `<Spotlight />` (client, renders nothing interactive; sets `--x`/`--y` on itself from pointer position; disabled under reduced motion or on touch-only devices); `<Glass as? className? children>` renders a `div` (or `as`) with class `glass rounded-[16px]` plus `className`; `prefersReducedMotion(): boolean` and `isHoverCapable(): boolean` in `lib/motion.ts` (both safe to call on the server, returning `false` / `true`).

- [ ] **Step 1: Write the failing motion helper test**

`tests/unit/motion.test.ts`:

```ts
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { prefersReducedMotion, isHoverCapable } from '@/lib/motion'

function mockMatchMedia(matches: Record<string, boolean>) {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: matches[q] ?? false, media: q, addEventListener() {}, removeEventListener() {} }))
}

describe('motion helpers', () => {
  it('reports reduced motion when the media query matches', () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    expect(prefersReducedMotion()).toBe(true)
  })
  it('reports hover capability from (hover: hover)', () => {
    mockMatchMedia({ '(hover: hover)': false })
    expect(isHoverCapable()).toBe(false)
    mockMatchMedia({ '(hover: hover)': true })
    expect(isHoverCapable()).toBe(true)
  })
  it('is safe without window', () => {
    vi.stubGlobal('window', undefined)
    expect(prefersReducedMotion()).toBe(false)
    expect(isHoverCapable()).toBe(true)
    vi.unstubAllGlobals()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run tests/unit/motion.test.ts
```
Expected: FAIL, cannot resolve `@/lib/motion`.

- [ ] **Step 3: Implement the helpers**

`lib/motion.ts`:

```ts
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isHoverCapable(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true
  return window.matchMedia('(hover: hover)').matches
}
```

- [ ] **Step 4: Run it to verify it passes**

```bash
npx vitest run tests/unit/motion.test.ts
```
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing e2e test for the spotlight**

`tests/e2e/spotlight.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('spotlight', () => {
  test('renders on a hover-capable desktop', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('spotlight')).toHaveCount(1)
  })

  test('is absent under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.getByTestId('spotlight')).toHaveCount(0)
  })
})
```

- [ ] **Step 6: Run it to verify it fails**

```bash
npx playwright test tests/e2e/spotlight.spec.ts --project=desktop
```
Expected: FAIL, no element with `data-testid="spotlight"`.

- [ ] **Step 7: Implement Spotlight and Glass, mount Spotlight in the layout**

`components/Spotlight.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { isHoverCapable, prefersReducedMotion } from '@/lib/motion'

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(!prefersReducedMotion() && isHoverCapable())
  }, [])

  useEffect(() => {
    if (!enabled) return
    let frame = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const el = ref.current
        if (!el) return
        el.style.setProperty('--x', `${(e.clientX / window.innerWidth) * 100}%`)
        el.style.setProperty('--y', `${(e.clientY / window.innerHeight) * 100}%`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [enabled])

  return (
    <>
      {enabled && (
        <div
          ref={ref}
          data-testid="spotlight"
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{ background: 'radial-gradient(700px circle at var(--x, 20%) var(--y, 30%), var(--spot), transparent 60%)' }}
        />
      )}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
    </>
  )
}
```

`components/Glass.tsx`:

```tsx
import type { ElementType, ComponentPropsWithoutRef, ReactNode } from 'react'

type GlassProps<T extends ElementType> = {
  as?: T
  className?: string
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>

export function Glass<T extends ElementType = 'div'>({ as, className = '', children, ...rest }: GlassProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  return (
    <Tag className={`glass rounded-[16px] ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
```

In `app/layout.tsx`, import `Spotlight` and render it as the first child inside `<ThemeProvider>`:

```tsx
<ThemeProvider>
  <Spotlight />
  <div className="relative z-10">{children}</div>
</ThemeProvider>
```

- [ ] **Step 8: Run the e2e test to verify it passes**

```bash
npx playwright test tests/e2e/spotlight.spec.ts --project=desktop
```
Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: spotlight background, grain, and Glass primitive

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Project data and the colophon date

**Files:**
- Create: `content/projects.ts`, `lib/colophon.ts`, `public/shots/shed.png`, `tests/unit/projects.test.ts`, `tests/unit/colophon.test.ts`

**Interfaces:**
- Produces: `projects: Project[]` where

```ts
export type ProjectStatus = 'live' | 'running' | 'ios'
export type Project = {
  slug: 'ccc' | 'bt' | 'shed' | 'bjs'
  title: string
  status: ProjectStatus
  statusLabel: string        // "Live", "Running", "iOS"
  href: string               // canonical link: live site, write-up path, App Store, or docs
  hrefLabel: string          // shown under the title, e.g. "ccc.lukeghanna.com"
  description: string
  tags: string[]
  screenshot?: { src: string; width: number; height: number; alt: string }
  writeup?: string           // "/work/bt" when a write-up exists
}
```
- `buildLabel(date?: Date): string` returning e.g. `"September 2026"`.

- [ ] **Step 1: Copy the curated Shedquarters capture into public**

```bash
mkdir -p public/shots
cp ".superpowers/brainstorm/73624-1790134772/content/shot-shed.png" public/shots/shed.png
node -e "const s=require('fs').readFileSync('public/shots/shed.png');console.log('w',s.readUInt32BE(16),'h',s.readUInt32BE(20))"
```
Expected: `w 1440 h 900`.

- [ ] **Step 2: Write the failing projects test**

`tests/unit/projects.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { projects } from '@/content/projects'

describe('projects', () => {
  it('has exactly the four projects in order', () => {
    expect(projects.map((p) => p.slug)).toEqual(['ccc', 'bt', 'shed', 'bjs'])
  })
  it('has unique slugs and absolute or root-relative hrefs', () => {
    const slugs = new Set(projects.map((p) => p.slug))
    expect(slugs.size).toBe(projects.length)
    for (const p of projects) expect(p.href).toMatch(/^(https?:\/\/|\/)/)
  })
  it('only references screenshots that exist in public', () => {
    for (const p of projects) {
      if (p.screenshot) expect(existsSync(`public${p.screenshot.src}`), `${p.slug} screenshot`).toBe(true)
    }
  })
  it('in v1 only Shedquarters has a screenshot', () => {
    expect(projects.filter((p) => p.screenshot).map((p) => p.slug)).toEqual(['shed'])
  })
  it('never uses projection language', () => {
    for (const p of projects) expect(p.description).not.toMatch(/projected|estimated|targeting/i)
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

```bash
npx vitest run tests/unit/projects.test.ts
```
Expected: FAIL, cannot resolve `@/content/projects`.

- [ ] **Step 4: Write the data**

`content/projects.ts`:

```ts
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
  screenshot?: { src: string; width: number; height: number; alt: string }
  writeup?: string
}

export const projects: Project[] = [
  {
    slug: 'ccc',
    title: 'Clippers Command Center',
    status: 'live',
    statusLabel: 'Live',
    href: 'https://ccc.lukeghanna.com',
    hrefLabel: 'ccc.lukeghanna.com',
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
    screenshot: { src: '/shots/shed.png', width: 1440, height: 900, alt: 'Shedquarters power rankings' },
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
```

- [ ] **Step 5: Run it to verify it passes**

```bash
npx vitest run tests/unit/projects.test.ts
```
Expected: PASS (5 tests).

- [ ] **Step 6: Write the failing colophon test**

`tests/unit/colophon.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildLabel } from '@/lib/colophon'

describe('buildLabel', () => {
  it('formats a date as Month YYYY in English', () => {
    expect(buildLabel(new Date('2026-09-22T12:00:00Z'))).toBe('September 2026')
    expect(buildLabel(new Date('2027-01-03T12:00:00Z'))).toBe('January 2027')
  })
  it('defaults to now', () => {
    expect(buildLabel()).toMatch(/^[A-Z][a-z]+ \d{4}$/)
  })
})
```

- [ ] **Step 7: Run it to verify it fails, implement, verify it passes**

```bash
npx vitest run tests/unit/colophon.test.ts
```
Expected: FAIL.

`lib/colophon.ts`:

```ts
export function buildLabel(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
}
```

```bash
npx vitest run tests/unit/colophon.test.ts
```
Expected: PASS (2 tests).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: project data, curated Shedquarters capture, colophon date

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Rail, theme toggle, and section tracking

**Files:**
- Create: `components/Rail.tsx`, `components/RailSpecular.tsx`, `components/ThemeToggle.tsx`, `components/SectionNav.tsx`, `components/LocalTime.tsx`, `tests/e2e/rail.spec.ts`

**Interfaces:**
- Produces:

```ts
// Rail.tsx
export type RailNavItem = { id: string; label: string; index: string }   // index "01"
export type RailLink = { label: string; handle: string; href: string }
export type RailProps =
  | { variant: 'home'; nav: RailNavItem[] }
  | { variant: 'article'; title: string; line: string; meta: { label: string; value: string }[]; links: RailLink[]; contents: RailNavItem[] }
export function Rail(props: RailProps): JSX.Element
```
- `<SectionNav items={RailNavItem[]} />` client: highlights the item whose section is in view; sections are elements with matching `id`.
- `<ThemeToggle />` client: two buttons with `aria-pressed`, `data-testid="theme-dark"` and `data-testid="theme-light"`.
- `<LocalTime />` client: renders `HH:MM PDT` for `America/Los_Angeles`, updates every 30s, `suppressHydrationWarning`.

- [ ] **Step 1: Write the failing e2e test**

`tests/e2e/rail.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('rail', () => {
  test('shows name, tagline, nav, and links', async ({ page }) => {
    await page.goto('/')
    const rail = page.getByTestId('rail')
    await expect(rail.getByRole('heading', { level: 1, name: 'Luke Hanna' })).toBeVisible()
    await expect(rail.getByText('Builds things end-to-end to understand them.')).toBeVisible()
    await expect(rail.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/llukehanna')
    await expect(rail.getByRole('link', { name: /Email/ })).toHaveAttribute('href', 'mailto:luke@lukeghanna.com')
  })

  test('theme toggle switches the html class and persists', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('theme-dark').click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.getByTestId('theme-light').click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('section nav tracks scrolling', async ({ page }) => {
    await page.goto('/')
    await page.locator('#contact').scrollIntoViewIfNeeded()
    await expect(page.getByTestId('nav-contact')).toHaveAttribute('aria-current', 'true')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx playwright test tests/e2e/rail.spec.ts --project=desktop
```
Expected: FAIL, no `data-testid="rail"`.

- [ ] **Step 3: Implement the client pieces**

`components/ThemeToggle.tsx`:

```tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const current = mounted ? resolvedTheme : undefined

  const btn = (name: 'dark' | 'light', glyph: string, label: string) => (
    <button
      type="button"
      data-testid={`theme-${name}`}
      aria-label={label}
      aria-pressed={current === name}
      onClick={() => setTheme(name)}
      className={`h-[26px] w-[30px] rounded-full text-[13px] transition-colors ${
        current === name ? 'bg-ink text-bg' : 'text-dim hover:text-ink'
      }`}
    >
      {glyph}
    </button>
  )

  return (
    <div className="flex gap-[2px] rounded-full border border-line bg-[var(--card)] p-[3px]" role="group" aria-label="Theme">
      {btn('dark', '◐', 'Dark theme')}
      {btn('light', '○', 'Light theme')}
    </div>
  )
}
```

`components/LocalTime.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { location } from '@/lib/site'

function format(d: Date) {
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: location.timeZone, timeZoneName: 'short' }).format(d)
}

export function LocalTime() {
  const [now, setNow] = useState<string>('')
  useEffect(() => {
    const tick = () => setNow(format(new Date()))
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])
  return <span suppressHydrationWarning>{now}</span>
}
```

`components/SectionNav.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import type { RailNavItem } from '@/components/Rail'

export function SectionNav({ items }: { items: RailNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el)
    const visible = new Map<string, number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
        let best = active
        let bestRatio = 0
        for (const [id, r] of visible) if (r > bestRatio) { best = id; bestRatio = r }
        if (bestRatio > 0 && best) setActive(best)
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  return (
    <nav aria-label="Sections" className="mt-11 flex flex-col gap-1">
      {items.map((i) => (
        <a
          key={i.id}
          href={`#${i.id}`}
          data-testid={`nav-${i.id}`}
          aria-current={active === i.id ? 'true' : undefined}
          className={`-mx-3 flex items-center justify-between rounded-[10px] px-3 py-[10px] text-[14px] font-medium transition-colors ${
            active === i.id ? 'bg-[var(--card)] text-ink' : 'text-mute hover:bg-[var(--card)] hover:text-ink'
          }`}
        >
          {i.label}
          <span className="font-mono text-[11px] text-dim">{i.index}</span>
        </a>
      ))}
    </nav>
  )
}
```

`components/RailSpecular.tsx`:

```tsx
'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { isHoverCapable, prefersReducedMotion } from '@/lib/motion'

export function RailSpecular({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (prefersReducedMotion() || !isHoverCapable()) return
    const el = ref.current
    if (!el) return
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--rx', `${((e.clientX - r.left) / r.width) * 100}%`)
      el.style.setProperty('--ry', `${((e.clientY - r.top) / r.height) * 100}%`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[16px]"
        style={{ background: 'radial-gradient(320px circle at var(--rx, 20%) var(--ry, 10%), rgba(255,255,255,0.09), transparent 60%)' }}
      />
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Implement Rail**

`components/Rail.tsx`:

```tsx
import Link from 'next/link'
import { Glass } from '@/components/Glass'
import { RailSpecular } from '@/components/RailSpecular'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SectionNav } from '@/components/SectionNav'
import { LocalTime } from '@/components/LocalTime'
import { links, location, siteName, siteTagline, siteDescription } from '@/lib/site'

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

const shell =
  'lg:fixed lg:left-6 lg:top-6 lg:bottom-6 lg:w-[340px] flex flex-col px-[34px] pb-7 pt-9 max-lg:m-4 max-lg:mb-0'

export function Rail(props: RailProps) {
  const homeLinks: RailLink[] = [links.github, links.linkedin, links.email]

  return (
    <RailSpecular>
      <Glass as="aside" data-testid="rail" className={shell}>
        <div className="absolute right-[18px] top-[18px]">
          <ThemeToggle />
        </div>

        {props.variant === 'home' ? (
          <>
            <h1 className="mt-[18px] text-[44px] font-bold leading-none tracking-[-0.04em]">{siteName}</h1>
            <p className="mt-[14px] text-[16px] font-medium leading-[1.4]">{siteTagline}</p>
            <p className="mt-[10px] text-[14px] leading-[1.55] text-mute">{siteDescription.replace(' Projects, built end-to-end.', '')}</p>
            <SectionNav items={props.nav} />
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
          {(props.variant === 'home' ? homeLinks : props.links).map((l) => (
            <LinkRow key={l.href} l={l} />
          ))}
          <div className="mt-[14px] flex justify-between font-mono text-[11px] tracking-[0.04em] text-dim">
            <span>{location.city}</span>
            <LocalTime />
          </div>
        </div>
      </Glass>
    </RailSpecular>
  )
}
```

- [ ] **Step 5: Give the home page real sections so the test can scroll**

Replace `app/page.tsx`:

```tsx
import { Rail, type RailNavItem } from '@/components/Rail'

const nav: RailNavItem[] = [
  { id: 'about', label: 'About', index: '01' },
  { id: 'work', label: 'Work', index: '02' },
  { id: 'contact', label: 'Contact', index: '03' },
]

export default function Home() {
  return (
    <>
      <Rail variant="home" nav={nav} />
      <main className="px-6 pb-20 pt-12 lg:pl-[400px] lg:pr-12">
        <section id="about" className="min-h-[60vh] scroll-mt-12">About</section>
        <section id="work" className="min-h-[100vh] scroll-mt-12">Work</section>
        <section id="contact" className="min-h-[60vh] scroll-mt-12">Contact</section>
      </main>
    </>
  )
}
```

- [ ] **Step 6: Run the e2e test to verify it passes**

```bash
npx playwright test tests/e2e/rail.spec.ts --project=desktop
```
Expected: PASS (3 tests). If "section nav tracks scrolling" is flaky, raise the `rootMargin` bottom value from `-60%` to `-50%` and re-run twice.

- [ ] **Step 7: Typecheck and commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: glass rail with theme toggle, section tracking, local time

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Home page: About, project rows with hover reveal, Contact

**Files:**
- Create: `components/Section.tsx`, `components/ProjectList.tsx`, `components/Tag.tsx`, `tests/e2e/home.spec.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `projects` from Task 4, `buildLabel` from Task 4, `Rail` from Task 5.
- Produces: `<Section id title index>` renders `<section id>` with a header row; `<ProjectList projects={Project[]} />` client component rendering one `<a data-testid="project-<slug>">` per project; `<Tag>` pill.

- [ ] **Step 1: Write the failing e2e test**

`tests/e2e/home.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('home', () => {
  test('lists the four projects with canonical links', async ({ page }) => {
    await page.goto('/')
    for (const slug of ['ccc', 'bt', 'shed', 'bjs']) await expect(page.getByTestId(`project-${slug}`)).toBeVisible()
    await expect(page.getByTestId('project-ccc')).toHaveAttribute('href', 'https://ccc.lukeghanna.com')
    await expect(page.getByTestId('project-bt')).toHaveAttribute('href', '/work/bt')
  })

  test('only Shedquarters has a screenshot reveal, shown on hover', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover only')
    await page.goto('/')
    await expect(page.getByTestId('reveal-shed')).toHaveCount(1)
    await expect(page.getByTestId('reveal-ccc')).toHaveCount(0)
    await page.getByTestId('project-shed').hover()
    await expect(page.getByTestId('reveal-shed')).toHaveAttribute('data-open', 'true')
  })

  test('contact shows the email and a build-time colophon', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#contact')).toContainText('luke@lukeghanna.com')
    await expect(page.locator('#contact')).toContainText(/last updated [A-Z][a-z]+ \d{4}/)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx playwright test tests/e2e/home.spec.ts --project=desktop
```
Expected: FAIL, no `project-ccc`.

- [ ] **Step 3: Implement Section and Tag**

`components/Section.tsx`:

```tsx
import type { ReactNode } from 'react'

export function Section({ id, title, index, note, children }: { id: string; title: string; index: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-[72px] scroll-mt-12">
      <div className="mb-[22px] flex items-baseline gap-[14px]">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">{title}</h2>
        <span className="font-mono text-[11px] text-dim">{note ? `${index} · ${note}` : index}</span>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>
      {children}
    </section>
  )
}
```

`components/Tag.tsx`:

```tsx
export function Tag({ children }: { children: string }) {
  return <span className="rounded-full bg-accent-soft px-[9px] py-[6px] text-[11px] font-medium text-accent">{children}</span>
}
```

- [ ] **Step 4: Implement ProjectList**

`components/ProjectList.tsx`:

```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import type { Project } from '@/content/projects'
import { Tag } from '@/components/Tag'

function Row({ p, index, dimmed, onEnter, onLeave }: { p: Project; index: number; dimmed: boolean; onEnter: () => void; onLeave: () => void }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLAnchorElement>(null)
  const external = p.href.startsWith('http')
  const Wrapper = external ? 'a' : Link

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    setPos({ x: Math.min(e.clientX - r.left + 24, r.width - 340), y: e.clientY - r.top - 120 })
  }

  return (
    <Wrapper
      ref={ref as never}
      href={p.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      data-testid={`project-${p.slug}`}
      onMouseEnter={() => { setOpen(true); onEnter() }}
      onMouseLeave={() => { setOpen(false); onLeave() }}
      onMouseMove={p.screenshot ? onMove : undefined}
      className={`group relative -mx-[22px] grid grid-cols-[48px_1.1fr_1.6fr_auto_40px] items-center gap-6 rounded-[14px] border border-transparent px-[22px] py-[26px] transition-[opacity,background,border-color,box-shadow] duration-300 ease-out hover:glass max-md:grid-cols-1 max-md:gap-3 ${dimmed ? 'opacity-50' : 'opacity-100'}`}
    >
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
    </Wrapper>
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
```

`hover:glass` needs the `glass` class registered as a Tailwind utility so the variant works. Add to `app/globals.css` right after the `.glass` rule:

```css
@utility glass {
  background: var(--glass);
  border-color: var(--glass-line);
  box-shadow: inset 0 1px 0 var(--glass-hl), var(--glass-shadow);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
}
```

(Keep the plain `.glass` rule too; `Glass.tsx` and the reveal use it directly.)

- [ ] **Step 5: Assemble the home page**

Replace `app/page.tsx`:

```tsx
import { Rail, type RailNavItem } from '@/components/Rail'
import { Section } from '@/components/Section'
import { ProjectList } from '@/components/ProjectList'
import { projects } from '@/content/projects'
import { buildLabel } from '@/lib/colophon'
import { links } from '@/lib/site'

const nav: RailNavItem[] = [
  { id: 'about', label: 'About', index: '01' },
  { id: 'work', label: 'Work', index: '02' },
  { id: 'contact', label: 'Contact', index: '03' },
]

const facts = [
  ['Now', 'Senior year, USC'],
  ['Summer 2026', 'Corp dev, Houlihan Lokey'],
  ['Builds with', 'Next.js, Postgres, Swift, Python'],
  ['Based in', 'Los Angeles'],
] as const

const built = buildLabel()

export default function Home() {
  return (
    <>
      <Rail variant="home" nav={nav} />
      <main className="px-6 pb-20 pt-12 lg:pl-[400px] lg:pr-12">
        <Section id="about" title="About" index="01">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
            <p className="text-[17px] leading-[1.6] text-mute">
              I&apos;m a senior at USC studying <b className="font-medium text-ink">computer science and business</b>, and I spent summer 2026 in
              corporate development at <b className="font-medium text-ink">Houlihan Lokey</b>. I build software on the side because it&apos;s the
              fastest way I know to understand how something works: the product shape, the systems behind it, the data, and getting it deployed.
              Everything on this page is self-initiated and running.
            </p>
            <dl className="grid grid-cols-2 gap-[10px] content-start max-md:grid-cols-1">
              {facts.map(([k, v]) => (
                <div key={k} className="rounded-[12px] border border-line bg-[var(--card)] p-[14px]">
                  <dt className="label mb-2">{k}</dt>
                  <dd className="text-[14px] font-medium leading-[1.3]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        <Section id="work" title="Work" index="02" note={`${projects.length} projects`}>
          <ProjectList projects={projects} />
        </Section>

        <Section id="contact" title="Contact" index="03">
          <p className="max-w-[640px] text-[17px] leading-[1.6] text-mute">
            The fastest way to reach me is{' '}
            <a href={links.email.href} className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
              {links.email.handle}
            </a>
            . I&apos;m also on{' '}
            <a href={links.github.href} target="_blank" rel="noreferrer" className="font-medium text-ink">GitHub</a> and{' '}
            <a href={links.linkedin.href} target="_blank" rel="noreferrer" className="font-medium text-ink">LinkedIn</a>.
          </p>
          <p className="mt-4 text-[13px] text-dim">Built with Next.js, deployed on Vercel, last updated {built}.</p>
        </Section>
      </main>
    </>
  )
}
```

- [ ] **Step 6: Run the e2e test to verify it passes**

```bash
npx playwright test tests/e2e/home.spec.ts --project=desktop
```
Expected: PASS (3 tests).

- [ ] **Step 7: Run everything and commit**

```bash
npm run typecheck && npm run test:unit && npx playwright test --project=desktop && npm run build
git add -A
git commit -m "feat: home page with about, project rows with hover reveal, contact

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: MDX write-up template with the BT content

**Files:**
- Create: `mdx-components.tsx`, `mdx.d.ts`, `content/work/bt.mdx`, `lib/toc.ts`, `lib/work.ts`, `components/ArticleSidebar.tsx`, `app/work/[slug]/page.tsx`, `app/not-found.tsx`, `tests/unit/toc.test.ts`, `tests/e2e/work.spec.ts`
- Modify: `next.config.ts`, `tsconfig.json` (include `mdx.d.ts`)

**Interfaces:**
- Produces:

```ts
// mdx.d.ts
export type WorkMeta = {
  title: string; line: string; status: string; role: string; stack: string; source: string
  links: { label: string; handle: string; href: string }[]
  glance: { label: string; value: string }[]
}
// lib/toc.ts
export function extractToc(mdxSource: string): { id: string; text: string }[]   // h2 only, ids via github-slugger
// lib/work.ts
export const workSlugs: readonly string[]          // ['bt']
export function readWorkSource(slug: string): string
```

- [ ] **Step 1: Write the failing toc test**

`tests/unit/toc.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { extractToc } from '@/lib/toc'

const src = `export const meta = { title: 'X' }

# Not included

## What it does

text

### Sub heading ignored

## Why these markets

\`\`\`
## not a heading, inside a code fence
\`\`\`

## Math & sizing
`

describe('extractToc', () => {
  it('collects only h2 headings, skipping code fences, with github slugs', () => {
    expect(extractToc(src)).toEqual([
      { id: 'what-it-does', text: 'What it does' },
      { id: 'why-these-markets', text: 'Why these markets' },
      { id: 'math--sizing', text: 'Math & sizing' },
    ])
  })
  it('returns an empty list when there are no h2s', () => {
    expect(extractToc('# only h1\n\ntext')).toEqual([])
  })
})
```

- [ ] **Step 2: Run it to verify it fails, then implement**

```bash
npx vitest run tests/unit/toc.test.ts
```
Expected: FAIL.

`lib/toc.ts`:

```ts
import GithubSlugger from 'github-slugger'

export function extractToc(mdxSource: string): { id: string; text: string }[] {
  const slugger = new GithubSlugger()
  const out: { id: string; text: string }[] = []
  let inFence = false
  for (const raw of mdxSource.split('\n')) {
    const line = raw.trimEnd()
    if (/^```/.test(line)) { inFence = !inFence; continue }
    if (inFence) continue
    const m = /^## (.+)$/.exec(line)
    if (m) {
      const text = m[1].trim()
      out.push({ id: slugger.slug(text), text })
    }
  }
  return out
}
```

```bash
npx vitest run tests/unit/toc.test.ts
```
Expected: PASS (2 tests). The `math--sizing` id matches what `rehype-slug` produces, because both use `github-slugger`.

- [ ] **Step 3: Configure MDX**

Replace `next.config.ts`:

```ts
import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
}

const withMDX = createMDX({
  options: {
    rehypePlugins: ['rehype-slug'],
  },
})

export default withMDX(nextConfig)
```

(Plugins are given as strings because Turbopack serializes the config.)

`mdx-components.tsx` at the project root:

```tsx
import type { MDXComponents } from 'mdx/types'

const components: MDXComponents = {
  h2: (props) => <h2 className="mb-[14px] mt-10 scroll-mt-16 text-[24px] font-semibold leading-[1.25] tracking-[-0.02em] text-ink first:mt-0" {...props} />,
  p: (props) => <p className="mb-4 text-[16px] leading-[1.65] text-mute" {...props} />,
  strong: (props) => <strong className="font-medium text-ink" {...props} />,
  pre: (props) => (
    <pre className="glass my-5 overflow-x-auto rounded-[12px] p-5 font-mono text-[13px] leading-[1.65] text-ink" {...props} />
  ),
  code: (props) => <code className="font-mono text-[0.95em]" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-[26px] rounded-[12px] border-l-2 border-accent bg-accent-soft px-5 py-[18px] text-[18px] font-medium leading-[1.45] text-ink [&>p]:m-0 [&>p]:text-ink [&>p]:text-[18px]" {...props} />
  ),
  ul: (props) => <ul className="mb-4 list-disc pl-5 text-[16px] leading-[1.65] text-mute" {...props} />,
  ol: (props) => <ol className="mb-4 list-decimal pl-5 text-[16px] leading-[1.65] text-mute" {...props} />,
  a: (props) => <a className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink" {...props} />,
}

export function useMDXComponents(): MDXComponents {
  return components
}
```

`mdx.d.ts` at the project root:

```ts
declare module '*.mdx' {
  import type { ComponentType } from 'react'
  export type WorkMeta = {
    title: string
    line: string
    status: string
    role: string
    stack: string
    source: string
    links: { label: string; handle: string; href: string }[]
    glance: { label: string; value: string }[]
  }
  export const meta: WorkMeta
  const MDXContent: ComponentType<Record<string, unknown>>
  export default MDXContent
}
```

In `tsconfig.json`, make sure `"include"` contains `"mdx.d.ts"` (add it to the existing array).

- [ ] **Step 4: Write the BT content**

`content/work/bt.mdx` (the text is adapted from Luke's public BT-docs README; nothing here is invented):

```mdx
export const meta = {
  title: 'BT',
  line: 'A Kalshi edge bot. The edge is in the pipeline, not the data.',
  status: 'Running · paper',
  role: 'Design, build, operate',
  stack: 'Python, systemd, Kalshi REST + WebSocket, Open-Meteo',
  source: 'Private. Engineering docs public.',
  links: [
    { label: 'Engineering docs', handle: 'github', href: 'https://github.com/llukehanna/BT-docs' },
  ],
  glance: [
    { label: 'Fee peak', value: '$0.0175 / contract' },
    { label: 'Sizing', value: 'fractional Kelly' },
    { label: 'Gate', value: 'reliability + Brier' },
    { label: 'Weather', value: 'KXHIGH* markets' },
    { label: 'Ensemble', value: '31-member GFS' },
  ],
}

BT identifies systematically mispriced contracts on Kalshi and places automated orders on them, and it will not trade until its own calibration says it can.

## What it does

Two market families. Daily high-temperature markets at US airports, where BT compares 31-member GFS ensemble forecasts from Open-Meteo against live contract prices. And NBA and NFL markets, where it compares de-vigged sharp consensus odds, aggregated from multiple books, against Kalshi pricing.

In both cases the pipeline has the same shape: **predict, compare, threshold, size, place, settle, measure.**

## Why these markets

Prediction markets reward engineering discipline over information asymmetry.

- **Objective settlement.** Weather settles off the NWS Daily Climate Report; sports settles off the final score. Calibration either works or it doesn't.
- **Retail-dominated flow.** Pricing inefficiencies persist longer than in equities or FX.
- **Public data.** GFS ensembles and consensus odds are free and high quality. There is no data moat; **the edge is in the pipeline.**
- **A quadratic fee structure** that makes edge math sharp and easy to reason about.

## Math

Kalshi's taker fee is quadratic in contract price. It peaks at $0.0175 per contract at P = 0.50 and falls to zero at the boundaries. Every edge calculation deducts fees per fill before deciding to trade; a net edge below the fee curve is not an edge. Maker orders avoid the fee entirely when filled passively.

```text
fee  = 0.07 * P * (1 - P)
edge = p_model - p_market - fee(p_market)
```

BT trades only when the absolute edge exceeds a calibrated threshold.

Sizing is fractional Kelly. Full Kelly maximizes long-run log wealth, but the drawdowns are brutal and miscalibration destroys the strategy. Fractional Kelly trades expected growth for survivability. Both the fraction and the position cap are hard-coded in config and cannot be raised without tripping the risk gate.

```text
kelly_fraction = f * (edge / (price * (1 - price)))
position_usd   = bankroll * min(kelly_fraction, max_position_pct)
```

> A model that says 70% and wins 55% of the time is broken, not edge.

Live trading is gated on calibration, not on any backtest P&L number. The calibration pipeline buckets historical signals by predicted probability and checks realized hit rate against predicted hit rate with reliability curves and Brier score.

## Architecture

Scheduled scans run on systemd timers. They fan out to forecast adapters (Open-Meteo GFS, HRRR, NBM, and METAR), market adapters (Kalshi REST and WebSocket, authenticated with RSA-PSS signing), and an odds adapter (de-vigged sharp consensus). A signal engine handles bracket parsing and thresholds; an odds engine handles de-vigging and averaging. Both feed a single risk gate before anything reaches the order layer.

## Safety

Paper trading is the default. Live trading requires the calibration pipeline to pass. Position size and Kelly fraction are capped in config. Every fill and every skipped signal is logged with the edge, the fee, and the reason, so the measure step of the pipeline is a real dataset rather than a P&L line.
```

- [ ] **Step 5: Write the work helper, sidebar, page, and 404**

`lib/work.ts`:

```ts
import { readFileSync } from 'node:fs'
import path from 'node:path'

export const workSlugs = ['bt'] as const
export type WorkSlug = (typeof workSlugs)[number]

export function isWorkSlug(s: string): s is WorkSlug {
  return (workSlugs as readonly string[]).includes(s)
}

export function readWorkSource(slug: WorkSlug): string {
  return readFileSync(path.join(process.cwd(), 'content', 'work', `${slug}.mdx`), 'utf8')
}
```

`components/ArticleSidebar.tsx`:

```tsx
import { Glass } from '@/components/Glass'
import { SectionNav } from '@/components/SectionNav'
import type { RailNavItem } from '@/components/Rail'

export function ArticleSidebar({ contents, glance }: { contents: RailNavItem[]; glance: { label: string; value: string }[] }) {
  return (
    <aside className="sticky top-6 hidden self-start xl:grid xl:gap-[14px]">
      <Glass className="rounded-[14px] p-4">
        <div className="label mb-2">Contents</div>
        <SectionNav items={contents} />
      </Glass>
      <Glass className="rounded-[14px] p-4">
        <div className="label mb-3">At a glance</div>
        <dl>
          {glance.map((g) => (
            <div key={g.label} className="flex justify-between border-t border-line py-2 text-[13px] text-mute">
              <dt>{g.label}</dt>
              <dd className="font-mono text-[12px] font-medium text-ink">{g.value}</dd>
            </div>
          ))}
        </dl>
      </Glass>
    </aside>
  )
}
```

`app/work/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Rail, type RailNavItem } from '@/components/Rail'
import { ArticleSidebar } from '@/components/ArticleSidebar'
import { extractToc } from '@/lib/toc'
import { isWorkSlug, readWorkSource, workSlugs } from '@/lib/work'
import { siteName } from '@/lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  return workSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!isWorkSlug(slug)) return {}
  const { meta } = await import(`@/content/work/${slug}.mdx`)
  return { title: meta.title, description: meta.line, openGraph: { title: `${meta.title} · ${siteName}`, description: meta.line } }
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isWorkSlug(slug)) notFound()

  const { default: Post, meta } = await import(`@/content/work/${slug}.mdx`)
  const contents: RailNavItem[] = extractToc(readWorkSource(slug)).map((h, i) => ({
    id: h.id,
    label: h.text,
    index: String(i + 1).padStart(2, '0'),
  }))

  return (
    <>
      <Rail
        variant="article"
        title={meta.title}
        line={meta.line}
        meta={[
          { label: 'Status', value: meta.status },
          { label: 'Role', value: meta.role },
          { label: 'Stack', value: meta.stack },
          { label: 'Source', value: meta.source },
        ]}
        links={meta.links}
        contents={contents}
      />
      <main className="px-6 pb-20 pt-12 lg:pl-[400px] lg:pr-12">
        <div className="grid gap-14 xl:grid-cols-[minmax(0,720px)_280px]">
          <article data-testid="article" className="prose-none [&>p:first-of-type]:mb-7 [&>p:first-of-type]:text-[22px] [&>p:first-of-type]:leading-[1.45] [&>p:first-of-type]:tracking-[-0.01em] [&>p:first-of-type]:text-ink">
            <Post />
          </article>
          <ArticleSidebar contents={contents} glance={meta.glance} />
        </div>
      </main>
    </>
  )
}
```

`app/not-found.tsx`:

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="label">404</p>
      <h1 className="text-[32px] font-bold tracking-[-0.03em]">Nothing here.</h1>
      <Link href="/" className="text-mute underline decoration-line underline-offset-4 hover:text-ink">Back to lukeghanna.com</Link>
    </main>
  )
}
```

- [ ] **Step 6: Write the failing e2e test, then run it**

`tests/e2e/work.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('write-up', () => {
  test('renders BT with headings that have ids matching the contents', async ({ page }) => {
    await page.goto('/work/bt')
    await expect(page.getByRole('heading', { level: 1, name: 'BT' })).toBeVisible()
    await expect(page.locator('h2#what-it-does')).toBeVisible()
    await expect(page.locator('h2#math')).toBeVisible()
    await expect(page.getByTestId('rail').getByTestId('nav-what-it-does')).toBeVisible()
  })

  test('contains the fee formula and no projection language', async ({ page }) => {
    await page.goto('/work/bt')
    const text = await page.getByTestId('article').innerText()
    expect(text).toContain('fee  = 0.07 * P * (1 - P)')
    expect(text).not.toMatch(/projected|estimated|illustrative/i)
  })

  test('unknown slug is a 404', async ({ page }) => {
    const res = await page.goto('/work/nope')
    expect(res?.status()).toBe(404)
  })
})
```

```bash
npx playwright test tests/e2e/work.spec.ts --project=desktop
```
Expected: PASS (3 tests). If TypeScript complains that `meta` is not exported from the dynamic import, confirm `mdx.d.ts` is in `tsconfig.json` `include` and restart `next dev`.

- [ ] **Step 7: Verify the build is static and commit**

```bash
npm run typecheck && npm run build
```
Expected: build output lists `○ /work/bt` as static (SSG), and `/` static.

```bash
git add -A
git commit -m "feat: MDX write-up template with BT content and article sidebar

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Route transitions, OG image, sitemap, robots, analytics

**Files:**
- Create: `app/opengraph-image.tsx`, `app/sitemap.ts`, `app/robots.ts`, `tests/e2e/meta.spec.ts`
- Modify: `app/layout.tsx`, `components/Rail.tsx`

**Interfaces:**
- Consumes: `siteUrl`, `workSlugs`.
- Produces: `/opengraph-image` (1200×630 PNG), `/sitemap.xml`, `/robots.txt`; the rail participates in view transitions under the name `rail`.

- [ ] **Step 1: Write the failing e2e test**

`tests/e2e/meta.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('sitemap lists home and the BT write-up', async ({ request }) => {
  const res = await request.get('/sitemap.xml')
  expect(res.ok()).toBeTruthy()
  const xml = await res.text()
  expect(xml).toContain('https://lukeghanna.com</loc>')
  expect(xml).toContain('https://lukeghanna.com/work/bt</loc>')
})

test('robots allows crawling and points at the sitemap', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text()
  expect(txt).toMatch(/Allow: \//)
  expect(txt).toContain('Sitemap: https://lukeghanna.com/sitemap.xml')
})

test('open graph image is served as a PNG', async ({ request }) => {
  const res = await request.get('/opengraph-image')
  expect(res.ok()).toBeTruthy()
  expect(res.headers()['content-type']).toContain('image/png')
})

test('home has og:image and a description', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Houlihan Lokey/)
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx playwright test tests/e2e/meta.spec.ts --project=desktop
```
Expected: FAIL (404 on sitemap).

- [ ] **Step 3: Implement the metadata routes**

`app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'
import { workSlugs } from '@/lib/work'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: siteUrl, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...workSlugs.map((slug) => ({ url: `${siteUrl}/work/${slug}`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.7 })),
  ]
}
```

`app/robots.ts`:

```ts
import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${siteUrl}/sitemap.xml` }
}
```

`app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { siteName, siteTagline } from '@/lib/site'

export const alt = `${siteName}: ${siteTagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 72, background: '#131110', color: '#f0ebe3', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>{siteName}</div>
        <div style={{ marginTop: 24, fontSize: 34, color: '#a39d94' }}>{siteTagline}</div>
        <div style={{ marginTop: 48, fontSize: 22, color: '#f2c14e', letterSpacing: 2 }}>LUKEGHANNA.COM</div>
      </div>
    ),
    size,
  )
}
```

- [ ] **Step 4: Add analytics and the view transition**

In `app/layout.tsx` add imports and render both components at the end of `<body>`:

```tsx
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
// ...
<body className="min-h-dvh bg-bg text-ink font-sans">
  <ThemeProvider>
    <Spotlight />
    <div className="relative z-10">{children}</div>
  </ThemeProvider>
  <Analytics />
  <SpeedInsights />
</body>
```

In `components/Rail.tsx`, import `ViewTransition` from React and wrap the outer element so the rail is a shared element between home and write-ups:

```tsx
import { ViewTransition } from 'react'
// ...
return (
  <ViewTransition name="rail">
    <RailSpecular>
      <Glass as="aside" data-testid="rail" className={shell}>
        {/* unchanged */}
      </Glass>
    </RailSpecular>
  </ViewTransition>
)
```

If TypeScript reports that `ViewTransition` is not exported from `react`, run `npm i -D @types/react@latest @types/react-dom@latest` and retry; React 19.3 ships it as stable and no `next.config` flag is needed.

- [ ] **Step 5: Run the e2e test to verify it passes, run the whole suite, commit**

```bash
npx playwright test tests/e2e/meta.spec.ts --project=desktop
npm run typecheck && npx playwright test --project=desktop && npm run build
git add -A
git commit -m "feat: OG image, sitemap, robots, analytics, rail view transition

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Responsive layout, reduced motion, and accessibility pass

**Files:**
- Create: `tests/e2e/a11y.spec.ts`, `tests/e2e/mobile.spec.ts`
- Modify: `components/Rail.tsx`, `components/ProjectList.tsx`, `app/page.tsx`, `app/globals.css` as needed by the tests

- [ ] **Step 1: Write the failing accessibility and mobile tests**

`tests/e2e/a11y.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const path of ['/', '/work/bt']) {
  for (const theme of ['dark', 'light'] as const) {
    test(`${path} has no axe violations in ${theme}`, async ({ page }) => {
      await page.goto(path)
      await page.getByTestId(`theme-${theme}`).click()
      await expect(page.locator('html')).toHaveClass(theme === 'dark' ? /dark/ : /^(?!.*dark).*$/)
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
    })
  }
}

test('every project row is reachable by keyboard and shows focus', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('project-ccc').focus()
  await expect(page.getByTestId('project-ccc')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByTestId('project-bt')).toBeFocused()
})
```

`tests/e2e/mobile.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile project only')

  test('rail sits above content and the page does not scroll horizontally', async ({ page }) => {
    await page.goto('/')
    const rail = await page.getByTestId('rail').boundingBox()
    const about = await page.locator('#about').boundingBox()
    expect(rail && about && rail.y + rail.height <= about.y + 1).toBeTruthy()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(overflow).toBe(false)
  })

  test('project rows stack and the screenshot reveal is not rendered', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('project-shed')).toBeVisible()
    await expect(page.getByTestId('reveal-shed')).toBeHidden()
  })
})
```

- [ ] **Step 2: Run them to see what fails**

```bash
npx playwright test tests/e2e/a11y.spec.ts --project=desktop
npx playwright test tests/e2e/mobile.spec.ts --project=mobile
```
Expected: some failures. Typical ones and their fixes are in the next step. Fix only what fails.

- [ ] **Step 3: Apply the fixes the tests demand**

Focus ring: add to `app/globals.css`:

```css
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 6px; }
```

Landmark and heading order: the rail's `<h1>` is the page's only h1 on home; on write-ups the article must not add another h1 (the MDX has none). If axe reports `region`, wrap the rail's contents so `<aside>` is the landmark (it already is) and ensure `<main>` exists on both pages (it does).

Color contrast on tag pills: if axe flags `text-accent` on `bg-accent-soft`, the fix is already in the tokens (5.1:1 light, 11:1 dark); the flag means the pill background stacked on `bg2` changed the effective color. Change `Tag.tsx` to use a solid background computed from the tokens:

```tsx
export function Tag({ children }: { children: string }) {
  return <span className="rounded-full border border-line bg-[var(--card)] px-[9px] py-[6px] text-[11px] font-medium text-accent">{children}</span>
}
```

Mobile rail: the `shell` class in `Rail.tsx` already switches to in-flow at `max-lg`. If the rail's `absolute` theme toggle overlaps the name on small screens, add `max-lg:relative max-lg:mb-4 max-lg:self-end` to the toggle wrapper and drop `absolute` under `max-lg`.

Horizontal overflow: the project grid `-mx-[22px]` pulls rows outside the container on mobile; add `max-md:mx-0 max-md:px-4` to the row class in `ProjectList.tsx`.

- [ ] **Step 4: Re-run both suites until green, then everything**

```bash
npx playwright test tests/e2e/a11y.spec.ts --project=desktop
npx playwright test tests/e2e/mobile.spec.ts --project=mobile
npx playwright test
npm run typecheck && npm run test:unit && npm run build
```
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: responsive rail, focus styles, axe-clean in both themes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Quality gate: Lighthouse, static verification, visual check

**Files:**
- Create: `scripts/lighthouse.sh`, `docs/QUALITY.md`

- [ ] **Step 1: Add a Lighthouse script against the production build**

`scripts/lighthouse.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
npm run build
npx next start -p 3100 &
PID=$!
trap 'kill $PID' EXIT
for i in $(seq 1 30); do curl -sf http://localhost:3100 >/dev/null && break; sleep 1; done
mkdir -p .lighthouse
for path in / /work/bt; do
  name=$(echo "$path" | tr '/' '_')
  npx --yes lighthouse "http://localhost:3100$path" --preset=desktop --quiet --chrome-flags="--headless=new" --output=json --output-path=".lighthouse/desktop$name.json"
  npx --yes lighthouse "http://localhost:3100$path" --quiet --chrome-flags="--headless=new" --output=json --output-path=".lighthouse/mobile$name.json"
done
node -e '
const fs=require("fs");let fail=false;
for(const f of fs.readdirSync(".lighthouse")){const r=JSON.parse(fs.readFileSync(".lighthouse/"+f));
 const s=Object.fromEntries(Object.entries(r.categories).map(([k,v])=>[k,Math.round(v.score*100)]));
 console.log(f.padEnd(28),JSON.stringify(s));
 for(const k of ["performance","accessibility","best-practices","seo"]) if(s[k]<95) fail=true;}
process.exit(fail?1:0)'
```

```bash
chmod +x scripts/lighthouse.sh
echo ".lighthouse/" >> .gitignore
```

- [ ] **Step 2: Run it**

```bash
./scripts/lighthouse.sh
```
Expected: four lines, every category ≥ 95, exit 0. If performance is below 95 on mobile, the usual causes here are the grain SVG (make it a 160px PNG in `public/grain.png` and reference it), the reveal image loading eagerly (add `loading="lazy"` to the `Image` in `ProjectList.tsx`), or fonts (confirm `display: 'swap'` and that only `latin` subsets load).

- [ ] **Step 3: Confirm every route is static**

```bash
npm run build 2>&1 | grep -E "^(┌|├|└|○|●|ƒ)" 
```
Expected: `/`, `/work/bt`, `/opengraph-image`, `/sitemap.xml`, `/robots.txt` marked `○ (Static)` or prerendered; no `ƒ (Dynamic)` routes.

- [ ] **Step 4: Visual check in both themes and three widths**

Start the dev server and open the browser pane at 1440, 900, and 390 pixel widths, toggling dark and light on `/` and `/work/bt`. Check against the spec: rail 340px with 24px inset on desktop; rows lift onto glass with siblings dimmed; the Shedquarters reveal follows the cursor and stays inside the row; write-up sidebar sticky on xl; nothing overflows on mobile. Fix anything off, re-run `npx playwright test`, and record what was checked in `docs/QUALITY.md`:

```md
# Quality log

## 2026-MM-DD v1 gate
- Lighthouse (desktop/mobile, / and /work/bt): scores pasted from scripts/lighthouse.sh
- Static routes confirmed from `next build`
- Visual check: 1440 / 900 / 390, dark and light, both routes
- Playwright: N tests passing (desktop + mobile)
- Known gaps: CCC screenshot pending in-season capture; BJS phone screenshots pending
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: Lighthouse gate script and quality log

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Repository, Vercel project, domain, subdomains, email

**Files:**
- Create: `docs/INFRA.md`, `README.md`

This task mixes steps the agent runs and steps only Luke can do (purchases and dashboard logins). The agent runs what it can, writes the rest into `docs/INFRA.md` as a checklist with exact values, and stops.

- [ ] **Step 1: Create the GitHub repo and push**

```bash
gh auth status
gh repo create llukehanna/lukeghanna.com --public --source . --remote origin --push --description "Personal site. Next.js, static, deployed on Vercel."
git branch --show-current
```
Expected: repo created, `main` pushed.

- [ ] **Step 2: Create and link the Vercel project, deploy a preview**

```bash
npx vercel@latest link --yes --project lukeghanna-com
npx vercel@latest git connect
npx vercel@latest deploy
```
Expected: project `lukeghanna-com` created on the Hobby team, connected to the GitHub repo, a preview URL printed. Open it and confirm both routes render.

- [ ] **Step 3: Promote to production**

```bash
npx vercel@latest deploy --prod
```
Expected: production URL `https://lukeghanna-com.vercel.app` renders the site. From here, every push to `main` deploys to production automatically.

- [ ] **Step 4: Write the infrastructure checklist Luke completes**

`docs/INFRA.md`:

```md
# Infrastructure checklist

Agent-run steps are done. The steps below need Luke because they involve a purchase or a dashboard login.

## 1. Buy the domain (Cloudflare)
1. https://dash.cloudflare.com → Domain Registration → Register Domains → search `lukeghanna.com` → add to cart → pay. Keep auto-renew on. WHOIS redaction is on by default.
2. Optional: backorder `lukehanna.com` at a backorder service (it expires 2026-11-26 and has been held since 2005; low odds).

## 2. DNS records (Cloudflare → lukeghanna.com → DNS → Records)
Set every record's proxy status to **DNS only** (grey cloud), not proxied.

| Type  | Name | Content                | Purpose |
|-------|------|------------------------|---------|
| A     | @    | 76.76.21.21            | apex → Vercel |
| CNAME | www  | cname.vercel-dns.com   | www → Vercel |
| CNAME | ccc  | cname.vercel-dns.com   | Clippers Command Center |
| CNAME | shed | cname.vercel-dns.com   | Shedquarters |

Then, from this repo:

    npx vercel@latest domains add lukeghanna.com
    npx vercel@latest domains add www.lukeghanna.com
    npx vercel@latest domains add ccc.lukeghanna.com clippers-command-center
    npx vercel@latest domains add shed.lukeghanna.com house-ladder

Vercel issues certificates automatically once the records resolve (usually under 10 minutes). Verify:

    curl -sI https://lukeghanna.com | head -1
    curl -sI https://ccc.lukeghanna.com | head -1
    curl -sI https://shed.lukeghanna.com | head -1

Expected: `HTTP/2 200` on all three. Set `www` to redirect to the apex in Vercel → Project → Settings → Domains.

## 3. Email (Cloudflare Email Routing)
1. Cloudflare → lukeghanna.com → Email → Email Routing → Get started. Cloudflare adds the MX and TXT records itself.
2. Destination address: lllukehanna@gmail.com (verify the confirmation email).
3. Custom address: `luke@lukeghanna.com` → forward to the destination.
4. Send-as from Gmail: Gmail → Settings → Accounts and Import → Send mail as → Add another email address → `luke@lukeghanna.com`, SMTP server `smtp.gmail.com`, port 587, username lllukehanna@gmail.com, password = a Google App Password (Google Account → Security → 2-Step Verification → App passwords). Verify with the code Gmail sends to the new address.

## 4. After the domain is live
- Update `siteUrl` in `lib/site.ts` only if the domain differs from `https://lukeghanna.com`.
- Point the GitHub profile README's project links at `ccc.lukeghanna.com` and `shed.lukeghanna.com`.
- Add the site to the LinkedIn profile's website field.

## 5. Pending content (any time)
- One curated CCC screenshot from a game day → `public/shots/ccc.png` (1440×900) → add `screenshot` to the `ccc` entry in `content/projects.ts` → update the "only Shedquarters" assertion in `tests/unit/projects.test.ts`.
- Three BJS phone screenshots → same pattern.
```

`README.md`:

```md
# lukeghanna.com

Personal site. Next.js App Router, statically generated, deployed on Vercel.

- `npm run dev` — local dev on http://localhost:3000
- `npm run test:unit` — Vitest (tokens, contrast, projects, toc, colophon)
- `npm run test:e2e` — Playwright (desktop + mobile, includes axe)
- `./scripts/lighthouse.sh` — production build + Lighthouse gate (≥95 everywhere)

Design: `docs/superpowers/specs/2026-09-22-personal-site-design.md`. Infra steps: `docs/INFRA.md`.
```

- [ ] **Step 5: Commit and push**

```bash
git add -A
git commit -m "docs: README and infrastructure checklist

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push
```

- [ ] **Step 6: Hand the checklist to Luke**

Report: production URL, the preview URL, and the four things in `docs/INFRA.md` that need him (domain purchase, DNS records, email routing, Gmail send-as). Stop.

---

## Self-review

**Spec coverage.**
- §2 Content: Rail (Task 5), About with four fact tiles (Task 6), four rows with number, title, status line, description, tags, arrow (Task 6), Contact with email and build-time colophon (Tasks 4, 6), BT write-up with rail meta and links, deck, sections, code, pull quote, sticky sidebar with Contents and At a glance (Task 7), Honesty rule (tests in Tasks 4 and 7 reject projection language; no fabricated media anywhere), Notes reserved (nothing built, nav is data-driven so adding it is one array entry).
- §3 Visual system: tokens and contrast (Task 2), glass material (Tasks 2, 3), background spotlight and grain, no blueprint grid (Task 3), Inter and Geist Mono via next/font (Task 2), spacing and radii (Tasks 5, 6).
- §4 Layout: desktop fixed rail at 340px/24px and main from 400px (Task 5); tablet and mobile (Task 9).
- §5 Interaction: section tracking (Task 5), row hover with glass, dimming, arrow, accent title (Task 6), screenshot reveal only with a real capture and only Shedquarters (Tasks 4, 6), theme toggle with persistence and no flash (Tasks 2, 5), route transitions with the rail as shared element (Task 8), motion rules and reduced motion (Tasks 2, 3, 9).
- §6 Architecture: stack, static rendering, file structure (Tasks 1 to 8).
- §7 Infrastructure: repo, Vercel project, domain, DNS, subdomains, email (Task 11).
- §8 Quality bar: Lighthouse ≥95 (Task 10), static routes (Task 10), keyboard and focus (Task 9), contrast (Task 2), reduced motion (Tasks 3, 9), both themes and three widths (Task 10), typecheck and build in every task.
- §10 What Luke supplies: captured in `docs/INFRA.md` (Task 11).

**Placeholder scan.** No TBD/TODO. Every code step has the code. Task 9 Step 3 lists concrete fixes keyed to specific failures rather than "fix issues." `docs/QUALITY.md` has a template the executor fills with measured numbers, not invented ones.

**Type consistency.** `RailNavItem` is defined in Task 5 and consumed unchanged in Tasks 6 and 7. `Project` fields used in `ProjectList` (`slug, title, statusLabel, hrefLabel, href, description, tags, screenshot`) match Task 4. `WorkMeta` fields used in the page (`title, line, status, role, stack, source, links, glance`) match `mdx.d.ts` and the MDX `meta` export. `extractToc` returns `{id, text}` and the page maps it to `{id, label, index}`. `contrastRatio` and `relativeLuminance` names match between `lib/contrast.ts` and both tests. Test ids used across specs: `rail`, `theme-dark`, `theme-light`, `nav-<id>`, `project-<slug>`, `reveal-<slug>`, `article`, `spotlight`.
