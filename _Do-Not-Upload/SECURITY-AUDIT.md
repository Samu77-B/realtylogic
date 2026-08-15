# Realty Logic — Security Audit

**Date:** 15 August 2026  
**Scope:** Full codebase (Next.js 15 App Router, Payload CMS, Stripe billing, Vercel)  
**Status:** Critical and high issues patched in this pass

This folder is for internal notes. Do not treat these files as public site content.

## Summary

The live app had a **critical unauthenticated Payload CMS password-recovery bug** (GHSA-hp5w-3hxx-vmwf) plus several authorization and secret-handling gaps. Those are fixed. Remaining npm advisories are blocked by Payload’s Next.js 15.4 support window or by breaking major bumps (sharp).

| Severity | Found | Fixed now |
| --- | ---: | ---: |
| Critical | 1 | 1 |
| High | 4 | 4 |
| Medium | 7 | 7 |
| Low | 5 | 5 |
| Residual (accepted / deferred) | 6 | — |

## What was fixed

### 1. Critical — Payload password recovery takeover

- **CVE / advisory:** [GHSA-hp5w-3hxx-vmwf](https://github.com/advisories/GHSA-hp5w-3hxx-vmwf) (CVE-2026-34751)
- **Was:** `payload` and `@payloadcms/*` at **3.79.0** (`< 3.79.1`)
- **Now:** all Payload packages pinned to **3.88.0**
- **Why it matters:** an unauthenticated attacker could take over a CMS account during forgot-password.

### 2. High — Hardcoded `PAYLOAD_SECRET` fallback

- **File:** `payload.config.ts`
- **Was:** `process.env.PAYLOAD_SECRET || 'change-me-in-production'`
- **Now:** `getPayloadSecret()` in `lib/security.ts` refuses to boot in production unless the secret is set and at least 32 characters.

### 3. High — Billing / user IDOR

- **File:** `collections/Users.ts`
- **Was:** any logged-in user could update **any** user, including `subscriptionStatus`. Admin `readOnly` is UI-only, so a REST `PATCH` could mark a subscription active without paying.
- **Now:**
  - Users may update **their own** profile only
  - Stripe fields have `access.create` / `access.update` locked (`false`); webhooks still use `overrideAccess: true`
  - Login lockout: 5 attempts, 15-minute lock, 8-hour session

### 4. High — Default admin password

- **Files:** `scripts/init-db.ts`, `README.md`
- **Was:** `ADMIN_PASSWORD` defaulted to `ChangeMe123!`
- **Now:** init/create-admin require a 12+ character password. `reset-admin` is blocked in production unless `ALLOW_ADMIN_RESET=true`.

### 5. Medium — Attack surface and public APIs

| Area | Change |
| --- | --- |
| GraphQL | Disabled (`graphQL.disable: true`) — unused |
| CORS / CSRF | Allowlisted to realtylogic.co.uk + localhost + Vercel URLs |
| Schema push | Never auto-pushes in production |
| Enquiry | Rate limit (8 / 15 min / IP), no Zod details or raw errors in the JSON |
| Billing / AI / upload | Generic error messages only |
| Uploads | MIME whitelist (jpeg/png/webp/gif/avif), rate limit |
| Realty AI | Max 40 messages, 8k chars each, 20 req/min |
| Property video | Only YouTube / Vimeo hostnames or https `.mp4/.webm/.ogg` |
| Security headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` |
| Collections | Explicit create/update/delete = logged-in user on agents and properties |

### 6. Low — Example env leak

`vercel.env.example` had a real-looking `STRIPE_PRICE_ID_YEARLY`. Replaced with an empty placeholder. Price IDs are not secret, but production IDs should not live in the repo.

## Residual risks (not patched this pass)

| Item | Why it stays | When to revisit |
| --- | --- | --- |
| Next.js 15.4.11 (several GHSA) | Payload 3.88 only supports `15.4.11`–`15.4.x`, not 15.5.23 | After Payload documents 15.5 / 16.2.6+ |
| Middleware bypass CVE-2026-44574 | This app does **not** use middleware for auth (Payload + API `getAdminUser` do) | Same as above |
| `sharp` &lt; 0.35 | 0.35 is a breaking bump; Payload still uses 0.34 | When Payload supports 0.35 |
| esbuild in drizzle-kit | Transitive via Payload; affects **dev** kit, not the public site | Payload upstream |
| Postgres `rejectUnauthorized: false` | Neon pooled connections commonly need this | If Neon publishes a CA that works on Vercel |
| In-memory rate limit | Each Vercel instance has its own map | Add Upstash / Vercel KV if spam becomes a problem |

## Infrastructure notes (Vercel / env)

Confirm in **Vercel → Settings → Environment Variables** (Production):

- [ ] `PAYLOAD_SECRET` is a random 32+ character string (same value as local if you share the DB)
- [ ] `DATABASE_URI` is the Neon **pooled** URL with `sslmode=require`
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs are live-mode values
- [ ] Webhook endpoint is `https://realtylogic.co.uk/api/billing/webhook` with signed events only
- [ ] `BLOB_READ_WRITE_TOKEN` is the Vercel Blob token (auto-set when Blob is linked)
- [ ] `RESEND_API_KEY` is restricted to the realtylogic.co.uk domain
- [ ] Preview deployments should not share production Stripe live keys if possible

Neon dashboard: restrict the role to this project; do not use a superuser string in Vercel.

## Checklist

- [x] Dependencies updated and secure *(Payload critical CVE gone; Next.js deferred — see residual)*
- [x] No hardcoded secrets
- [x] Input validation implemented
- [x] Authentication secure
- [x] Authorization properly configured

## How to re-run this audit

```bash
npm audit
npm outdated
```

Do **not** run `npm audit fix --force` — it would install Next.js 15.5.23, which Payload 3.88 does not support.
