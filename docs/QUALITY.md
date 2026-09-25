# Quality log

## 2026-09-23 v1 gate

**Lighthouse** (desktop/mobile, `/` and `/work/bt`, against `npx next start -p 3100` production build, via `scripts/lighthouse.sh`):

```
desktop_.json                {"performance":100,"accessibility":100,"best-practices":96,"seo":100,"agentic-browsing":100}
desktop_work_bt.json         {"performance":100,"accessibility":100,"best-practices":96,"seo":100,"agentic-browsing":100}
mobile_.json                 {"performance":98,"accessibility":100,"best-practices":96,"seo":100,"agentic-browsing":100}
mobile_work_bt.json          {"performance":98,"accessibility":100,"best-practices":96,"seo":100,"agentic-browsing":100}
```

All four gated categories (performance, accessibility, best-practices, seo) are ≥ 95 on both routes, both device presets, on the first run — no remedies from the brief (PNG grain, lazy reveal image, font subsetting) were needed. Fonts were already `latin`-subset with `display: 'swap'`; the grain layer is a tiny inline SVG data URI, not a network request. Scores were re-measured after the visual-check fix below and are unchanged.

**Static routes** (`npm run build`):

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /opengraph-image
├ ○ /robots.txt
├ ○ /sitemap.xml
└   /work/[slug]
  └ ● /work/bt

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)
```

Every route is static or SSG-prerendered. No `ƒ (Dynamic)` routes.

**Visual check**: 1440×900, 900×1000, 390×844, light and dark, `/` and `/work/bt`, via a throwaway Playwright script against the `next start -p 3100` build (script not committed; `.superpowers/` is git-ignored). Screenshots saved under `.superpowers/sdd/2026-09-22-personal-site/shots/`:

- `home-light-1440.png` / `home-dark-1440.png` — rail measures 340px wide with a consistent ~24px gap to viewport edge and to content; About cards, Work rows, and Contact all align to the rail's inset. Good contrast in both themes.
- `home-light-900.png` / `home-dark-900.png` — rail becomes a non-fixed card at the top of a single column; nothing overflows; row grid still holds title/description/tags across the width.
- `home-light-390.png` / `home-dark-390.png` — rows stack to a single column (`max-md:grid-cols-1`), tags left-align, no horizontal scroll, text remains readable in both themes.
- `home-light-1440-shed-hover.png` / `home-dark-1440-shed-hover.png` — hovering `project-shed` at 1440 shows `reveal-shed` anchored near the cursor, clamped horizontally so it never crosses the rail or the viewport edge (`Math.min(e.clientX - r.left + 24, r.width - 340)` in `ProjectList.tsx`); it extends below the single row's height because the 340px-wide screenshot is taller than one row — expected, matches the existing green `home.spec.ts` assertions for `data-open`.
- `work-bt-light-1440.png` / `work-bt-dark-1440.png` — left rail (title/meta/contents) and right `ArticleSidebar` (contents + "at a glance") both sit in the `xl:grid-cols-[minmax(0,720px)_280px]` layout with the article column between them; readable in both themes.
- `work-bt-light-1440-scrolled.png` — scrolled 1400px down the article; both the left rail and the right sidebar stay pinned at the top of the viewport (`lg:fixed` rail, `sticky` sidebar) and the active TOC entry ("Safety") highlights correctly, confirming the sidebar is sticky on xl.
- `work-bt-light-900.png` / `work-bt-dark-900.png` — single column below `xl`, code blocks fit their container, no overflow.
- `work-bt-light-390.png` / `work-bt-dark-390.png` — after the fix below: page `scrollWidth` is exactly 390 in both themes; code blocks scroll horizontally inside their own rounded `pre` box instead of widening the page.

**Defect found and fixed**: at 390px width, `/work/bt` had a real horizontal-overflow bug that `/` did not — `document.documentElement.scrollWidth` measured 573px against a 390px viewport. Root cause: `<article>` is a CSS Grid item (`grid gap-14 xl:grid-cols-[...]` in `app/work/[slug]/page.tsx`) and grid items default to `min-width: auto`, so the grid track was sized to the widest unbreakable content inside the article — the longest `pre` code line (`position_usd = bankroll * min(kelly_fraction, max_position_pct)`, ~549px in 13px monospace) — instead of shrinking to the viewport and letting the code block's own `overflow-x-auto` scroll internally. Fix: added `min-w-0` to the `<article>` grid item in `app/work/[slug]/page.tsx` so it can shrink below its content's intrinsic width.

That fix made the code block's internal horizontal scroll real for the first time at narrow widths, which surfaced a genuine new axe violation on mobile (`scrollable-region-focusable`, WCAG 2.1.1/2.4.3: a scrollable region must be reachable and operable from the keyboard). Fixed by adding `tabIndex={0}` to the `pre` renderer in `mdx-components.tsx`.

Re-ran after both fixes: `npx playwright test` (full suite, desktop + mobile) — 43 passed, 5 skipped (intentional mobile-only skips), 0 failed. Lighthouse re-run — scores unchanged from above (all ≥ 95).

**Known gaps**: CCC screenshot pending in-season capture; BJS phone screenshots pending.

## 2026-09-23 post-v1 follow-ups

The five minors deferred from the v1 review, plus the CCC write-up.

- **One observer per page.** `SectionNav` used to run its own IntersectionObserver per instance, so home (rail list + mobile bar) and the article template (rail + sidebar) each ran two observers over the same sections. The observer now lives in `ActiveSectionProvider` (`components/ActiveSection.tsx`), rendered once per page around the rail and main column; every `SectionNav` reads the active id from context and is a pure renderer.
- **Bar height tied to scroll margin.** The mobile bar's height and the sections' `scroll-margin-top` were two independent numbers (`py-[10px]` vs `scroll-mt-12`). Both now read one CSS variable, `--nav-bar-h` (48px, `app/globals.css`), so an anchor jump can never land a heading under the bar. `tests/e2e/mobile.spec.ts` asserts the bar's bounding box is pinned at `y = 0` after scrolling (stickiness, previously only inferred from `aria-current`) and that a clicked section's top is at or below the bar's height.
- **Sitemap `lastmod` removed.** The only value available at build time is the build date, which marked every URL as modified on every deploy. A `lastmod` that is not the real modification date is worse than none, so it is omitted; `tests/e2e/meta.spec.ts` asserts no `<lastmod>` is emitted.
- **Code blocks focusable only when they overflow.** `pre` was always `tabIndex={0}`, making every code block a tab stop even when nothing scrolled. `components/CodeBlock.tsx` measures `scrollWidth > clientWidth` under a ResizeObserver and sets `tabIndex` only then. axe's `scrollable-region-focusable` stays clean on mobile (where the BT blocks do overflow) and desktop blocks are no longer tab stops; `tests/e2e/work.spec.ts` asserts focusability equals overflow on both projects.
- **Package renamed** from `site` to `lukeghanna.com` in `package.json` and the lockfile.
- **CCC write-up** at `/work/ccc`, drafted from the Clippers-Command-Center repository's own README, `docs/ARCHITECTURE.md`, `docs/PROJECT.md`, schema, and code (`app/api/live/route.ts`, `scripts/poll-live.ts`, `scripts/generate-insights.ts`, `scripts/lib/insights/proof-utils.ts`, `src/lib/insights/live.ts`, `hooks/useLiveData.ts`). Every number in it traces to a constant or a comment in that repo: 12 s poll and SWR refresh, 60 s staleness threshold, 8-point run and clutch thresholds, 5-minute clutch window, 2-minute play-by-play lookback, three backfilled seasons (2022 to 2024), top-5% rare events, importance capped at 100, 1024 px minimum width. Counts the README states but a shallow clone cannot verify (route and commit totals) were left out. Per the spec's precedent (BT), a project with a write-up links to it from the home row and the write-up's rail carries the live-site link; the article rail now also shows Previous / Next between write-ups in `workSlugs` order.
- **Defect found and fixed: the fixed rail could overflow its card.** Measured with a throwaway script against `next start -p 3100`: on `/work/ccc` at 1440×900 the rail's content ended at y≈969 against a card bottom of 876 (the three-line title, five contents rows and three links exceed the viewport), and `/work/bt` already overflowed at 1440×760 (846 vs 736) before this change, since the `lg:fixed` shell had `overflow: visible`. The shell is now `lg:overflow-y-auto` with the scrollbar hidden (`.scroll-quiet`), so the rail scrolls internally and nothing spills past the card; `tests/e2e/work.spec.ts` asserts this at 1440×700. The specular overlay is positioned within the scroll container and scrolls with it, which is invisible in practice (it is a soft hover gradient). Home fits at every measured size (1440×900, 1440×760, 1024×768).
- **Playwright in sandboxes.** `playwright.config.ts` honours `PW_CHROMIUM=<path>` to launch a pre-installed Chromium instead of the downloaded one. Local runs are unchanged.

Gate re-run after these changes: `npm run lint`, `npm run typecheck`, `npm run test:unit` (34 passed), `npx playwright test` (61 passed, 9 intentional skips, desktop + mobile, axe clean on `/`, `/work/ccc`, `/work/bt` in both themes), `npm run build` (all routes static; `/work/ccc` SSG).

## 2026-09-23 write-ups v2, seven projects, About, monogram

Spec amendment: `docs/superpowers/specs/2026-09-23-write-ups-v2.md`.

**Source material.** Four research passes over local checkouts of the project repositories (`bt`, `BT-docs`, `beacon`, `PFC-docs`, `Shedquarters`, `OnAir`, `Blackjack-Strategy`, `clippers-command-center`, and the GitHub profile README). Findings that changed the site:

- BT was not renamed (the `kwx` package name is internal); the public docs now lead with a negative result over 7,440 settled signals, three data bugs, and a settlement guard that halted the bot for six weeks. The old write-up ("Running · paper", "trading bot for weather and sports") was wrong on every status claim and was rewritten from the public docs. The market-maker experiment is a design and a partial plan with nothing built or run, and the write-up says exactly that.
- PFC is presented as **Personal Finance Coach** (briefly "Hurdle" on 2026-09-23; renamed at Luke's request on 2026-09-24, URL `/work/pfc`). No screenshots by design: every screen shows real balances.
- Beacon's repository sanitizer forbids the employer, vendor and real firm names; the write-up follows the same rule and names only the fellowship (Palantir's American Tech Fellowship, Frontiers, May to July 2026, per Luke). The `api/` layer and seed are absent from the repo, so there are no captures until it runs.
- CCC's scheduler is GitHub Actions cron, not Vercel Cron as its README says; the write-up now says so. Its `vercel.json` is empty.
- OnAir ships no third-party sources and its demo runs against local fixture streams; the write-up describes the failover engineering and nothing else. Its captures show the fixture source (colour bars) and public schedule data only.
- BJS's README status is stale: the app layer was discarded on 2026-09-23 and is being rebuilt on the tested engine. The write-up says so, and the row reads "engine done, app in rebuild".
- Shedquarters's home-row blurb said Elo; it is OpenSkill. Fixed.

**Template.** Figures: `Figure` (image or muted looping video with a poster and a captions track; reduced motion pauses it and shows controls), `Flow` (a vertical sequence of steps drawn from the code, each node a real module, table or state), and Markdown tables via `remark-gfm` inside a scroll box that is focusable only when it overflows. Every figure has a number, a caption and a provenance line. Figures fade in on scroll (`Reveal`); nothing is hidden without JavaScript, and reduced motion disables the effect. Every home row links to its write-up; the write-up rail carries an "Open" link for live destinations plus Previous / Next.

**Media provenance.** `public/work/shed/*` and `public/work/onair/*` are copied from those repositories' `docs/media/`, recorded from the real apps against made-up players and a fixture source respectively. `public/shots/onair.png` is OnAir's home screen from the same set. The home cards' other captures were taken on 2026-09-24 from the running apps, dark theme, scrollbars hidden, nothing edited: `beacon.png` (beacon.lukeghanna.com home, 1440×810 @2x, synthetic data), `ccc.png` (clippers.lukeghanna.com home, 1440×810 @2x, preseason: 0–0 record), `shed.png` (shed.lukeghanna.com power rankings, 880×495 @3x), `bjs.png` (the strategy trainer mid-drill in the iOS 18.3 simulator, built from BJS `main-8v0ds1` at `ab042af`, launched with `BJS_UI_TESTING=1`, downsized to 660×1434). PFC and Kalshi Weather Edge have no capture: PFC's screens show real balances and KWX has no interface, so their cards show one figure from the write-up instead.

**Monogram.** `app/icon.svg` is "LH" in Inter ExtraBold tracked at −0.07em, converted to a path from the font file (no runtime font), theme-aware through a `prefers-color-scheme` rule inside the SVG. `app/apple-icon.tsx` renders the same path on the dark charcoal at 180px. The OG image carries it top-left and the home rail shows it above the name (`components/Mark.tsx`). The Vercel-default `favicon.ico` is gone. Candidates compared: Inter ExtraBold, Inter SemiBold, Geist Mono Bold, Inter lowercase; two serif options were dropped because they sit outside the site's type system.

**Visual check** at 1440×900 (light and dark) and 390×844 (`next start -p 3100`, throwaway script): home with seven rows and four tiles; PFC's diagram and tables; Shedquarters with the phone video in a glass frame; OnAir's desktop capture; BT's three results tables; Beacon's rule loop. `scrollWidth` equals the viewport on every page and width. One nit found and fixed: Beacon's "Rule support" glance value collided with its label.

Gate: `npm run lint`, `npm run typecheck`, `npm run test:unit` (33 passed), `npx playwright test` (91 passed, 9 intentional skips; axe clean on `/` and all seven write-ups in both themes on desktop and mobile), `npm run build` (all routes static; seven SSG write-ups).

## 2026-09-24 mobile version

The site reflowed on phones before, but a write-up put about 1,000px of rail (title, meta, the full contents list, links, location) between the top of the page and the first paragraph, project rows spent a line on their number and another on an arrow, the four tiles stacked into four cards, and a Flow row of four parallel nodes squeezed into 358px. Measured with a throwaway script against `next start -p 3100` at iPhone 13 (390) and Pixel 7 (412): the article's top edge sat at y≈1003 (BT), 1046 (Beacon), 1014 (Shedquarters).

Changes, all below `md` (768px) unless noted:

- **Write-up rail** keeps the back link, title, one line, the Open link and the four meta rows (now a 2×2 grid); the contents list and the link list are hidden. The article's top edge is now at y≈566 (BT), 588 (Beacon), 609 (Shedquarters). `tests/e2e/mobile.spec.ts` asserts it stays under 720.
- **Article bar** (`components/ArticleBar.tsx`): a sticky glass bar with "← Work", the current section as "02/06 · The result", and a disclosure button that opens the full contents list (Escape or an outside tap closes it; `aria-expanded` and `aria-controls` wired). Reads the same `ActiveSectionProvider` as every other nav, so it adds no observer.
- **Article footer** (`components/ArticleFooter.tsx`): the rail's links (docs or source, Previous, Next) close the article instead. **At a glance** (`components/Glance.tsx`, extracted from the sidebar) renders inline after the article below `xl`, where the sidebar is hidden, so a phone reader gets the key-value table too.
- **Project rows**: the number sits inline before the title and the arrow is hidden; row padding tightens.
- **About tiles** collapse into one divided key-value card.
- **Flow rows** of parallel nodes use two columns below `sm` (`.flow-row`, `--cols`) and one column per node above.
- **Home bar** links fill the bar's full height for a larger tap target.
- **Viewport and manifest**: `theme-color` for both schemes, `viewport-fit=cover`, and `app/manifest.ts` (name, monogram icons, standalone display) so "Add to Home Screen" works properly.

Gate: `npm run lint`, `npm run typecheck`, `npm run test:unit` (33), `npx playwright test` (98 passed, 9 intentional skips; the neighbour tests read the footer on the mobile project and the rail on desktop), `npm run build` (all routes static, plus `/manifest.webmanifest`). `scrollWidth` equals the viewport on `/`, `/work/bt` and `/work/shed` at both phone widths. A note for future captures: kill any earlier `next start` before rebuilding, or the running server keeps serving HTML whose CSS chunks the rebuild has deleted, which looks like a broken layout and is not one.

## 2026-09-24 second pass over the project repositories

Every checkout was refreshed and four research passes diffed each repository against the commit its write-up was drafted from. Changes applied to the site:

- **BT → Kalshi Weather Edge** (`/work/kwx`). The private repo renamed itself on 2026-09-23 and merged the bracket market maker: `kwx/mm/`, `kwx quote tick` and `quote report`, two new risk rules, launchd and systemd units installed but not enabled, off by default. It has placed zero orders on demo or live and has no results; the write-up gains a section and a quote-tick Flow that say exactly that, with the two gates (a two-week demo plumbing gate with no profit criterion, then a four-week live verdict needing at least a hundred fills with positive markout and realized P&L). Tests 749 → 875; the public docs repo is still BT-docs, so the link is unchanged. Every forecast-side number on the page is untouched by these commits.
- **Beacon is live** at beacon.lukeghanna.com (Vercel Functions + Neon, a 700-firm synthetic universe, thirty days of seeded history, nightly reset at 04:00 UTC plus a throttled Reset button) and public as `beacon-demo` under MIT, a byte-identical copy of the private repo. Four 1440×900 captures of the deployed demo were copied into `public/work/beacon/` and one as the hover reveal; every firm name in them is invented. The Claude clusterer is wired (claude-opus-5, structured output, one call per ten minutes and twenty-four a day, heuristic fallback); whether the flag is on in production is unverified, so the write-up says "when enabled". Rule support is four distinct firms, tests 186 → 214.
- **CCC** hardened in 31 commits: the production poll is a five-minute GitHub Actions cron (the twelve-second loop is an operator script), the stale threshold is seven minutes, the client polls at twelve seconds live and five minutes idle, box scores are written by the nightly job rather than the cron route, `proof_hash` is now an identity key (category, entities, season, metric) rather than a hash of the proof, `proof_result` comes from executing `proof_sql`, a nightly `verify-insights` re-runs every active proof, rare events are top 1% of every NBA player-game, a sixth category (year over year) exists, ingest is league-wide, and tests are 159 → 227. The write-up, its glance and its Flow were corrected line by line. The number of seasons in the database could not be verified without database access, so the page no longer states one.
- **Shedquarters** added spikeball as a second sport with its own ladder, theme and live night; margins scale with the target score; tests 561 → 683 across 49 files; merges to main deploy with migrations in the build. The existing captures predate spikeball and now say so in their provenance lines.
- **BJS**: all new work is on an unmerged working branch, so the page says so. Three of eight rebuild steps are done (engine completion, the design system pending its freeze review, the strategy trainer end to end); 231 engine and 97 app tests plus four UI tests are green in CI; two strategy cells were corrected. Still nothing released and no captures.
- OnAir, PFC-docs and the profile README did not change.

Gate before merge: lint, typecheck, unit, the full Playwright suite on desktop and mobile with axe on every page in both themes, and the production build.

## 2026-09-24 Shedquarters captures refreshed

The Shedquarters repository had no new commits after the second pass, but its captures on the site predated spikeball. To refresh them honestly, the app was run here: Postgres 16 started locally under the `postgres` user, `npm run migrate` applied the schema, a throwaway seed (`scripts/seed-demo.ts`, not committed anywhere) created twelve made-up players and 59 games across three beer-die nights, one finished spikeball night and one open spikeball night, and `next start` served the production build on port 3200. Captures at 390×844 at 2× (780×1688, matching Luke's originals) after passing the gate with the example PIN: the beer-die ladder with the Die / Spike pill and live dot, spikeball table mode with the 25 / 15 / 11 picker, and the spikeball game log. Their provenance lines say exactly that. The demo video and its poster are still Luke's own recordings from before spikeball and still say so. The desktop hover capture on the home row is unchanged.

## v2 home (2026-09-24)

About first, then every project as the same card (double-bezel media slot, status line, one sentence, stack in mono) in a two-column grid closed by a GitHub card; no project is featured. "Work" is now "Projects" in every label (routes stay `/work/*`). Geist replaces Inter; one easing token (`--ease`); a fixed warm glow behind the rail so the glass has something to blur, and an accent hairline on the rail and on a hovered card. The rail lists the seven projects under Projects and tracks the card in view; a write-up's contents appear once (the sidebar at xl, the rail between md and xl). Contact is a copy-to-clipboard email button plus two links. On a phone the home rail is a plain header, not a card.

Gate: `npm run lint`, `npm run typecheck`, `npm run test:unit` (34 passed), `npx playwright test` (102 passed, 12 intentional skips; axe clean everywhere in both themes on desktop and mobile), `npm run build`.
