# lukeghanna.com

Personal site. Next.js App Router, statically generated, deployed on Vercel. Seven project write-ups in `content/work/*.mdx` with figures (`Figure`, `Flow`, Markdown tables) that each carry a provenance line.

- `npm run dev` — local dev on http://localhost:3000
- `npm run test:unit` — Vitest (tokens, contrast, projects, toc, colophon, motion, smoke)
- `npm run test:e2e` — Playwright (desktop + mobile, includes axe); set `PW_CHROMIUM=/path/to/chrome` to use a pre-installed browser
- `./scripts/lighthouse.sh` — production build + Lighthouse gate (≥95 everywhere)

Design: `docs/superpowers/specs/2026-09-22-personal-site-design.md`, amended by `docs/superpowers/specs/2026-09-23-write-ups-v2.md`. Infra steps: `docs/INFRA.md`. Quality log: `docs/QUALITY.md`.
