# Infrastructure checklist

Status as of 2026-09-23. Steps the agent can run are done or noted below; the rest need Luke because they involve a purchase or a dashboard login.

## 1. Domain (Cloudflare) — DONE
`lukeghanna.com` is registered at Cloudflare (WHOIS: created 2026-09-23, Cloudflare nameservers). Auto-renew and WHOIS redaction are Cloudflare defaults; no action needed.

Optional, still open: backorder `lukehanna.com` at a backorder service (it expires 2026-11-26 and has been held since 2005; low odds).

## 2. DNS records — DONE (2026-09-23)

All records live at Cloudflare, DNS-only:

| Type  | Name     | Content                      | Serves |
|-------|----------|------------------------------|--------|
| A     | @        | 76.76.21.21                  | lukeghanna.com (Vercel project `lukeghanna-com`) |
| CNAME | www      | cname.vercel-dns.com         | 308 redirect to the apex |
| CNAME | clippers | (Vercel-managed CNAME)       | Clippers Command Center (project `clippers-command-center`) |
| CNAME | shed     | (Vercel-managed CNAME)       | Shedquarters (project `house-ladder`) |

Verified with `curl -sI https://<host>`: apex 200, www 308, clippers 307 to /home, shed 200. A stray `ccc.lukeghanna.com` is also attached to `clippers-command-center` with no DNS record; remove it in Vercel → Project → Settings → Domains whenever convenient.

## 3. Email — not needed

The site's contact address is Luke's existing `luke@zhannas.com`. No Email Routing on lukeghanna.com is planned.

## 4. After the domain is live
- Update `siteUrl` in `lib/site.ts` only if the domain differs from `https://lukeghanna.com`.
- Point the GitHub profile README's project links at `clippers.lukeghanna.com` and `shed.lukeghanna.com`.
- Add the site to the LinkedIn profile's website field.

## 5. Pending content (any time)
- One curated CCC screenshot from a game day → `public/shots/ccc.png` (1440×900) → add `screenshot` to the `ccc` entry in `content/projects.ts` → extend the capture list in `tests/unit/projects.test.ts` and `tests/e2e/home.spec.ts`; a `Figure` in `content/work/ccc.mdx` with a provenance line.
- BJS phone screenshots once an app exists to capture → same pattern.
- Beacon captures once `api/` and the seed land and it runs end to end, of generic seed data only.
- All seven write-ups (`content/work/*.mdx`) were drafted on 2026-09-23 from each repository's docs and code; review the prose once and adjust anything that reads differently from how Luke would say it.
