# Security checklist (post-fix)

Use this after deploy. Tick locally; do not publish this folder.

## Dependencies

- [x] Payload 3.88.0 (fixes GHSA-hp5w-3hxx-vmwf)
- [x] `npm audit fix` applied (non-breaking)
- [ ] Next.js 15.5+ when Payload allows it
- [ ] sharp 0.35+ when Payload allows it

## Secrets

- [x] No `PAYLOAD_SECRET` fallback in production
- [x] No default `ChangeMe123!` admin password
- [x] Stripe yearly price ID removed from `vercel.env.example`
- [x] `.env` is gitignored
- [ ] Rotate `PAYLOAD_SECRET` if it was ever committed or shared
- [ ] Confirm Vercel env vars are Production-only where they should be

## Auth / authz

- [x] Login lockout (5 attempts / 15 min)
- [x] Users can only update their own profile
- [x] Stripe billing fields not writable via CMS API
- [x] GraphQL disabled
- [x] CORS / CSRF allowlisted
- [x] `reset-admin` blocked in production

## Input / APIs

- [x] Enquiry Zod schema + honeypot + rate limit
- [x] Upload MIME whitelist + size cap + auth
- [x] Realty AI payload size limits
- [x] Property video hostname allowlist
- [x] API routes do not return `error.message`

## Headers / network

- [x] `X-Content-Type-Options: nosniff`
- [x] `X-Frame-Options: SAMEORIGIN`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Permissions-Policy` (camera/geo off; mic self for Realty AI)
- [ ] Vercel Firewall / bot protection reviewed in the dashboard
