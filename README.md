# lukeghanna.com

Personal site. Next.js App Router, exported as static files (`output: 'export'`) and served as Cloudflare Workers static assets. `npm run deploy` builds and deploys. Eleven project write-ups in `content/work/*.mdx` with figures (`Figure`, `Flow`, Markdown tables) that each carry a provenance line.

- `npm run dev` — local dev on http://localhost:3000
- `npm run test:unit` — Vitest (tokens, contrast, projects, toc, colophon, motion, smoke)
- `npm run test:e2e` — Playwright (desktop + mobile, includes axe); set `PW_CHROMIUM=/path/to/chrome` to use a pre-installed browser
- `./scripts/lighthouse.sh` — production build + Lighthouse gate (≥95 everywhere)

Infra steps: `docs/INFRA.md`. Quality log: `docs/QUALITY.md`.
