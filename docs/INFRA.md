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
| CNAME | beacon   | (Vercel-managed CNAME)       | Beacon demo (project `beacon`), added 2026-09-24 |

Verified with `curl -sI https://<host>`: apex 200, www 308, clippers 307 to /home, shed 200. A stray `ccc.lukeghanna.com` is also attached to `clippers-command-center` with no DNS record; remove it in Vercel → Project → Settings → Domains whenever convenient.

## 3. Email — not needed

The site's contact address is Luke's existing `luke@zhannas.com`. No Email Routing on lukeghanna.com is planned.

## 4. After the domain is live
- Update `siteUrl` in `lib/site.ts` only if the domain differs from `https://lukeghanna.com`.
- Point the GitHub profile README's project links at `clippers.lukeghanna.com` and `shed.lukeghanna.com`.
- Add the site to the LinkedIn profile's website field.

## 5. Pending content (any time)
- Replace `public/shots/ccc.png` (a preseason capture, 0–0 record) with one from a game day once the season starts (Oct 21), same 1440×810 @2x framing; add a `Figure` in `content/work/ccc.mdx` with a provenance line.
- Retake `public/shots/bjs.png` once the rebuild lands on BJS `main`.
- All seven write-ups (`content/work/*.mdx`) were drafted on 2026-09-23 from each repository's docs and code; review the prose once and adjust anything that reads differently from how Luke would say it.
