# Infrastructure checklist

Status as of 2026-09-23. Steps the agent can run are done or noted below; the rest need Luke because they involve a purchase or a dashboard login.

## 1. Domain (Cloudflare) — DONE
`lukeghanna.com` is registered at Cloudflare (WHOIS: created 2026-09-23, Cloudflare nameservers). Auto-renew and WHOIS redaction are Cloudflare defaults; no action needed.

Optional, still open: backorder `lukehanna.com` at a backorder service (it expires 2026-11-26 and has been held since 2005; low odds).

## 2. DNS records (Cloudflare → lukeghanna.com → DNS → Records)

`shed.lukeghanna.com` is already attached to the Vercel project `house-ladder` via a Vercel-managed CNAME, verified, and serving Shedquarters over HTTPS — no action needed there.

The records below are still missing. Set every record's proxy status to **DNS only** (grey cloud), not proxied.

| Type  | Name | Content                | Purpose |
|-------|------|------------------------|---------|
| A     | @    | 76.76.21.21            | apex → Vercel |
| CNAME | www  | cname.vercel-dns.com   | www → Vercel |
| CNAME | ccc  | cname.vercel-dns.com   | Clippers Command Center |

Then, from this repo:

    npx vercel@latest domains add lukeghanna.com
    npx vercel@latest domains add www.lukeghanna.com
    npx vercel@latest domains add ccc.lukeghanna.com clippers-command-center

Vercel issues certificates automatically once the records resolve (usually under 10 minutes). Verify:

    curl -sI https://lukeghanna.com | head -1
    curl -sI https://ccc.lukeghanna.com | head -1

Expected: `HTTP/2 200` on both. Set `www` to redirect to the apex in Vercel → Project → Settings → Domains.

Note: the Vercel project for this site (`lukeghanna-com`) and the GitHub repo (`llukehanna/lukeghanna.com`) don't exist yet either — those are separate publish steps being handled outside this pass. The `domains add lukeghanna.com` / `www.lukeghanna.com` commands above assume the `lukeghanna-com` project has already been created and linked.

## 3. Email (Cloudflare Email Routing) — NOT done
No MX records exist yet for `lukeghanna.com`.

1. Cloudflare → lukeghanna.com → Email → Email Routing → Get started. Cloudflare adds the MX and TXT records itself.
2. Destination address: your Gmail address (verify the confirmation email).
3. Custom address: `luke@lukeghanna.com` → forward to the destination.
4. Send-as from Gmail: Gmail → Settings → Accounts and Import → Send mail as → Add another email address → `luke@lukeghanna.com`, SMTP server `smtp.gmail.com`, port 587, username your Gmail address, password = a Google App Password (Google Account → Security → 2-Step Verification → App passwords). Verify with the code Gmail sends to the new address.

## 4. After the domain is live
- Update `siteUrl` in `lib/site.ts` only if the domain differs from `https://lukeghanna.com`.
- Point the GitHub profile README's project links at `ccc.lukeghanna.com` and `shed.lukeghanna.com`.
- Add the site to the LinkedIn profile's website field.

## 5. Pending content (any time)
- One curated CCC screenshot from a game day → `public/shots/ccc.png` (1440×900) → add `screenshot` to the `ccc` entry in `content/projects.ts` → update the "only Shedquarters" assertion in `tests/unit/projects.test.ts`.
- Three BJS phone screenshots → same pattern.
