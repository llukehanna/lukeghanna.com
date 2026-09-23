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
