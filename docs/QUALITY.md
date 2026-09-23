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
