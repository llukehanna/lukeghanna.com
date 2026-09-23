# lukeghanna.com: design

Date: 2026-09-22
Status: draft for Luke's review

## 1. Purpose

A delivery layer for Luke's projects. When Luke would otherwise send someone his GitHub, he sends this instead. The page has to make four projects legible to a non-engineer in thirty seconds, and it has to look like it was made by someone with taste. It doubles as the thing Luke opens on his laptop when an interviewer says "walk me through something you built."

It is not a blog, a personal brand, a resume host, or a "now" page. Nothing on it is fabricated, projected, or undated.

## 2. Content

Three sections on one page, plus one article template.

**Home**
- Rail: name, one line ("Builds things end-to-end to understand them."), two-sentence bio (USC CS + Business, Houlihan Lokey corp dev), section nav, contact links (GitHub, LinkedIn, email), location and local time, theme toggle.
- About: one paragraph, evidence not adjectives, plus four fact tiles (Now, Summer 2026, Builds with, Based in). Kept extremely brief per Luke's call.
- Work: four project rows. Clippers Command Center, BT, Shedquarters, BJS. Each row: number, title, status line (Live / Running / iOS) with the canonical link, one to two sentence description, tags, arrow.
- Contact: one paragraph with the email, plus a one-line colophon ("Built with Next.js, deployed on Vercel, last updated <month year>"). The date is generated at build time so it can never go stale.

**Project write-up** (article template)
- v1 ships one: BT, adapted from the existing BT-docs README. CCC is the second, drafted from the GSD build notes, and ships when written.
- Rail becomes: back link, project name, one line, meta (Status, Role, Stack, Source), links (engineering docs, previous, next).
- Main: deck paragraph, sections with h2, prose, code blocks, figures with numbered captions, one pull quote. Sticky glass sidebar on the right with Contents (tracks scroll) and At a glance (a small key-value table).
- Shedquarters and BJS link out (live site, App Store) and have no write-up in v1.

**Honesty rule.** Every number on the site is a hard, verifiable output or is labeled as a modeled scenario with its assumptions. No "projected," no "estimated," no illustrative logs, no fake charts. Same rule as Luke's resume.

**Reserved, not built:** a Notes index. The design leaves room for it in the nav; it appears only when there are three finished notes.

## 3. Visual system

**Theme.** User-selectable dark and light, persisted, defaulting to the OS preference. Toggle lives in the rail.

| Token | Dark (warm charcoal) | Light (stone) |
|---|---|---|
| bg | #131110 | #e9e6e0 |
| bg-2 (cards) | #1a1715 | #f3f1ec |
| ink | #f0ebe3 | #151412 |
| mute | #a39d94 | #5f5b55 |
| dim | #8a847b | #6b675f |
| line | rgba(255,255,255,.09) | rgba(0,0,0,.10) |
| accent | #f2c14e (amber) | #7a5a00 (amber, darkened for contrast) |
| accent-soft | rgba(242,193,78,.14) | rgba(122,90,0,.14) |

Contrast verified 2026-09-22 (WCAG relative luminance): every text token on its background is at least 4.5:1. dim is 5.1 (dark) and 4.5 (light); accent is 11.2 (dark) and 5.1 (light). A unit test guards these ratios so the tokens can't drift below AA.

**Material: glass.** The identifying element. Used for the rail, the hover state of project rows, the write-up sidebar, and code blocks.
- Fill: linear gradient from ~7% white to ~2% white (dark); ~70% to ~40% white (light).
- Border: 1px at 10% white (dark) / 8% black (light).
- Inner top highlight: `inset 0 1px 0` at 14% white (dark) / 90% white (light).
- Backdrop: `blur(20px) saturate(1.2)`.
- Specular: a radial highlight that follows the cursor across the rail only. Disabled on touch and under `prefers-reduced-motion`.

**Background.** Flat color, a very soft cursor spotlight (radial, ~7% warm white, 700px), and a film-grain overlay at ~7% opacity. No gradients, no imagery, no blueprint grid.

**Type.** Inter for UI and prose, Geist Mono for metadata (numbers, labels, status lines, code). Loaded through `next/font` with size-adjusted fallbacks to avoid layout shift.
- Rail name: 44px / 700 / -0.04em.
- Row title: 22px / 600 / -0.02em.
- Prose: 16px / 1.65. Section h2 in write-ups: 24px / 600.
- Labels: Geist Mono 10 to 11px, uppercase, 0.08em tracking.

**Spacing and shape.** 16px radius on the rail and cards, 10px on nav items and small panels, 999px on tags. Rail is 340px wide with 24px inset from the viewport edge. Main content starts at 400px and runs to the right edge with 48px right padding. Sections are separated by 72px.

## 4. Layout

**Desktop (≥1100px).** Fixed glass rail on the left, full-height with 24px margins. Main column scrolls independently and fills everything to the right. Nothing is centered in a container; the page uses the width.

**Tablet (700 to 1100px).** Rail narrows to 280px; the four fact tiles go to one column; row descriptions wrap.

**Mobile (<700px).** Rail becomes a static header above the content: name, one line, bio, contact links in a row, theme toggle. Section nav becomes a sticky top bar with the three section names. Project rows stack vertically: title, status, description, tags, arrow.

## 5. Interaction

**Section nav tracking.** The current section is highlighted as the main column scrolls, using an IntersectionObserver. Clicking scrolls smoothly (native `scroll-behavior`, honored by reduced-motion).

**Project rows.**
- Hover: the row lifts onto a glass panel (fill, border, inner highlight, blur, shadow); the other rows dim to ~50% opacity; the arrow nudges up-right; the title takes the accent color.
- Screenshot reveal: only for projects that have a curated real capture. On hover, the image slides in beside the row inside a glass frame, offset from the cursor, and follows it within the row's bounds. Rows without a capture show no frame at all. In v1 that is Shedquarters only. CCC gets one when Luke captures it in-season. BJS gets phone frames when Luke takes three screenshots.
- Click anywhere on the row opens the canonical link (live site, write-up, App Store, or engineering docs).

**Theme toggle.** Two-state pill in the rail. Uses `next-themes`, persists to localStorage, no flash on load.

**Route transitions.** React's `ViewTransition` (stable in 19.3) between home and write-ups, with the rail as a shared element so it appears to stay put while the content swaps. Falls back to an instant swap where unsupported.

**Motion rules.** Springs and ease-out only, 200 to 500ms. No smooth-scroll library, no cursor follower, no magnetic buttons, no entrance choreography on the home page beyond a single fade. Everything animated respects `prefers-reduced-motion`.

## 6. Architecture

**Stack.** Next.js (App Router, latest stable), TypeScript, Tailwind CSS v4 with the tokens above as CSS variables, `next-themes`, MDX for write-ups, `next/font`, Vercel Analytics and Speed Insights. Motion library only if a hover or transition can't be done in CSS; start without one.

**Rendering.** Every route is statically generated. No server code at runtime. No database.

**Structure.**
```
app/
  layout.tsx            theme provider, fonts, analytics, rail slot
  page.tsx              home: About, Work, Contact
  work/[slug]/page.tsx  write-up template, MDX rendered at build
  opengraph-image.tsx   generated OG image (name, one line, dark)
  sitemap.ts, robots.ts
components/
  Rail.tsx              glass rail, both variants (home / article)
  ProjectRow.tsx        row + hover glass + optional screenshot reveal
  Section.tsx           header with number and hairline
  Glass.tsx             the material as one component
  Spotlight.tsx         cursor spotlight + grain, client-only, reduced-motion aware
  ThemeToggle.tsx
  ArticleSidebar.tsx    contents + at-a-glance
content/
  projects.ts           the four projects: title, status, link, description, tags, screenshot?
  work/bt.mdx           BT write-up (from BT-docs)
  work/ccc.mdx          later
public/
  shots/shed.png        curated captures only
```

Projects are plain data in `content/projects.ts`; write-ups are MDX with frontmatter (title, one line, status, role, stack, source, at-a-glance pairs). The at-a-glance and contents panels are derived from frontmatter and headings, not hand-maintained.

## 7. Infrastructure

- **Domain:** lukeghanna.com, registered by Luke at Cloudflare (at-cost pricing, free email routing). DNS stays at Cloudflare in DNS-only mode pointing at Vercel. Backorder lukehanna.com separately; it expires 2026-11-26 and has been held since 2005, so odds are low.
- **Email:** Cloudflare Email Routing forwards luke@lukeghanna.com to Gmail. Gmail "send as" configured so replies come from the domain.
- **Subdomains:** ccc.lukeghanna.com → the existing `clippers-command-center` Vercel project. shed.lukeghanna.com → the existing `house-ladder` project. Both are custom-domain additions to the existing projects; nothing moves.
- **Hosting:** new Vercel project `lukeghanna-com` on the Hobby plan, connected to a new GitHub repo `llukehanna/lukeghanna.com`. Main deploys to production; every PR gets a preview URL.
- **Not built:** resume route, go/ redirects, tools subdomain.

## 8. Quality bar

- Lighthouse 95+ on all four categories, mobile and desktop, on both routes.
- Core Web Vitals green on a throttled mobile profile. No layout shift from fonts or images (all images sized).
- Keyboard: every row and link reachable and visibly focused; theme toggle is a button; nav tracking does not steal focus.
- Contrast: all text passes WCAG AA in both themes, including amber tag text on stone.
- Reduced motion: spotlight, specular, row lift, and view transitions all degrade to static.
- Both themes and all three breakpoints checked in the browser before merge.
- Build passes with zero TypeScript errors; `next build` output confirms every route is static.

## 9. Out of scope (v2 candidates)

Notes index. Live data on the rows (CCC record, Shedquarters leader) via each project's own API. CCC write-up. BJS phone screenshots. A tools subdomain for small utilities. Sound, 3D, shaders.

## 10. What Luke supplies

1. Buy lukeghanna.com and set up Cloudflare (I'll give exact steps; I can't enter payment details).
2. Set up Email Routing and Gmail "send as."
3. Read the BT write-up draft and correct anything that's wrong or reveals strategy.
4. One curated CCC screenshot when the season starts.
5. Three BJS phone screenshots, whenever.

## 11. Time

Design system, rail, home, and rows: one weekend. Write-up template and BT content: one evening. Infrastructure: one hour once the domain is bought. Total roughly 20 to 25 hours including polish and the quality pass.
