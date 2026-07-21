# DEPLOYMENT.md — FAMEU Infrastructure & Release

> CKR Technologies · **Version:** v1.1 · **Date:** 19 Jul 2026
> How FAMEU runs and ships, so deployment knowledge doesn't live only in one head. Companion: `INTEGRATIONS.md`, `JOBS.md`, `AGENTS.md`.

## Environments

| Env | Supabase project | API URL | Gateway keys | Purpose |
|---|---|---|---|---|
| **dev** | castcall-dev | `dev-api.castcall...` | test | Active development, seeded demo data. |
| **staging** | castcall-staging | `staging-api...` | test | UAT, release rehearsal, real-device QA. |
| **prod** | castcall-prod | `api.castcall...` | live | Live users. |

Separate Supabase projects per env — testing never touches real user data or live payments. `/api/v1` versioning lets prod app stay working while the backend evolves.

## Backend (Express) on CKR VPS

- Node process managed by **PM2** (cluster mode), behind **Nginx** reverse proxy with SSL (Certbot/Let's Encrypt, auto-renew).
- One `.env` per environment on the box (never in git); all keys read only via `src/config/secrets.js`.
- Nginx: routes `/api/` → PM2 app; serves the admin SPA static build at the admin subdomain; raw body preserved for `/api/v1/webhooks/payments` (signature verification needs the unparsed body).
- Rate limiting at Nginx + app level (OTP, payments, auth).
- Deploy: build → copy → `pm2 reload` (zero-downtime). Rollback: `pm2 reload` the previous release dir (keep last 3 releases).

## Admin panel (React + Vite)

- Built to static assets, served by Nginx at the admin subdomain, HTTPS only, behind admin auth + 2FA. No SSR needed (internal tool).

## Mobile (React Native)

- Android: Gradle release build → Play Console (Internal Testing → Production).
- iOS: Xcode/Fastlane → App Store Connect (TestFlight → Production).
- Env via build-time config (dev/staging/prod API URL, Supabase anon key, Maps key, gateway mode). Never bundle service/secret keys in the app.
- Optional JS-only fixes via self-hosted OTA (Hot Updater) post-launch; native changes always go through the stores.

## Media & CDN

- Supabase Storage for media; CDN in front of the public bucket for portfolio thumbnails/video. Private-docs bucket never behind a public CDN — signed-URL access only.

## Monitoring & backup

- **Sentry** on backend + mobile for error monitoring.
- Nightly Supabase DB backup; `db-backup-verify` job confirms restorability (JOBS.md).
- Basic uptime check on the API health endpoint; alert on failure.

## Release checklist (per store release)

- [ ] Migrations applied to prod; seed/reference data present.
- [ ] Gateway switched to **live** keys; a real ₹10 test post refunded.
- [ ] Prod Supabase + prod API URL + restricted Maps keys wired into the build.
- [ ] Webhook URL registered with the gateway (prod), signature secret set.
- [ ] Push (FCM/APNs) configured for the prod bundle ids.
- [ ] Privacy policy + terms hosted and linked (store requirement; content via AD-12).
- [ ] Account-deletion flow verified in-app (store requirement).
- [ ] Sentry receiving prod events; backup + restore verified once.
- [ ] Git tagged; API.md + Postman collection archived at this version.

## First-time setup (one-time)

VPS provisioned, Node + PM2 + Nginx + Certbot installed, three Supabase projects created, gateway + FCM + Maps accounts set up with keys placed in each env's `.env` via the secrets gateway. Recorded here so it's repeatable, not tribal knowledge.
