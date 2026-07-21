# ARCHITECTURE.md — FAMEU

> CKR Technologies · **Version:** v1.1 · **Date:** 19 Jul 2026
> What talks to what, and where each kind of logic lives, so code lands in the right layer. Companion: `AGENTS.md`, `API.md`, `SCHEMA.md`.

## System shape

Two separate RN apps (FAMEU Artist, FAMEU Hiring — PRD L11) share one monorepo and one backend; each sends an `X-App` header so the backend knows the caller's app/role. Auth is email-OTP only (PRD L12).

```
[FAMEU Artist app] ┐
[FAMEU Hiring app] ┼── HTTPS /api/v1 (X-App) ──> [Nginx] ──> [Express (PM2)] ──> [Supabase: Postgres+Auth+Storage]
[Admin SPA (web)] ┘                                        │                        │
                                                           ├─> [Cashfree/Razorpay]  │
     [Supabase Realtime] <──── chat channels ──────────────┼─> [FCM push]           │
                                                           └─> [Google Maps geocode]│
                    [Gateway] ── webhook ──> [Express /webhooks/payments] ──────────┘
```

- Apps never call Supabase tables directly for business data — they go through `/api/v1`. The one exception is **Realtime chat subscription** (read-side broadcast), which uses the Supabase client with RLS scoping; message **writes** still go through `POST /messages`.
- The gateway webhook is the only inbound path allowed to change money/go-live state.

## Backend — Domain-Driven structure (Express)

`src/domains/<name>/` each with `routes.js → controller.js → service.js → repository.js → validation.js`. `app.js` imports only each domain's `routes.js`. A domain's repository is the **only** file touching that domain's tables.

Domains: `auth`, `artists`, `media`, `companies`, `verification`, `auditions`, `applications`, `interviews`, `messaging` (comm-requests + conversations + messages), `payments`, `notifications`, `fraud`, `admin`.

- `controller` = thin (parse, call service, shape response). `service` = business logic. `repository` = DB access. `validation` = joi schemas, run before the controller touches anything.
- **Secrets gateway:** only `src/config/secrets.js` reads `process.env`; it exposes scoped exports. Most domains get just the Supabase client (via `config/database.js`); `payments` gets gateway keys, `auth` gets the JWT/OTP secret, `notifications` gets the FCM credential. ESLint `no-restricted-properties` bans `process.env` outside `src/config/**`.
- Adding a domain = copy the file shape + register one line in `app.js`. Never restructure what exists.

### Where logic lives (so it doesn't sprawl)
- Payment go-live transition: **payments domain service**, triggered by the webhook — not in auditions.
- Chat gate (conversation may exist only after accepted request/shortlist): **messaging service**, checked on conversation creation.
- Verification gate (no post before approved): **middleware** + auditions service, plus the DB can't reach `active` without a confirmed payment.
- Background jobs: their own runners (JOBS.md), calling the same domain services — never duplicating logic.

## Frontend — two apps, shared monorepo (RN + admin)

FAMEU Artist and FAMEU Hiring are **separate RN apps** that share code via a monorepo:
```
apps/artist/   ← entry, artist-only domains, artist tab navigator
apps/hiring/   ← entry, hiring-only domains, hiring tab navigator
packages/shared/  ← theme, ui components, api base (RTK store + baseQuery with X-App), auth domain, chat domain
```
Auth and chat live in `packages/shared/` because both apps use them identically (email-OTP auth, the same conversation/message screens). Artist-only domains (audition discovery, applications) live in `apps/artist`; hiring-only domains (posting, talent search, verification, payments) live in `apps/hiring`. Within each app the DDD shape holds:

`src/domains/<name>/` holds that domain's screens/pages, its RTK slice (if any client state), and its RTK Query endpoint file. `shared/` (the package) holds theme, cross-domain UI components, navigation/router assembly, and the RTK store/api base. A domain imports only from itself and `shared/` — never into another domain's internals or the other app.

- All server data via RTK Query (gives loading/empty/error/refresh for free — DESIGN.md §4).
- Client state (session, offline queue, form drafts, UI flags) via RTK slices.
- Navigation assembly + theme live in `shared/`, consumed everywhere.

## Sync vs async

- **Sync (request/response):** everything under `/api/v1`.
- **Async (fire-and-forget / eventual):** push sends, geocoding retries, payment reconcile, audition expiry — via jobs or bounded background tasks, never blocking a user request.
- **Realtime:** chat only.

## Non-negotiables (also in AGENTS.md)
- RLS on every table; two-layer auth (middleware + RLS).
- Webhook is the sole money/go-live authority; client callback never trusted.
- Audit-sensitive rows immutable; corrections append.
- No secret outside the secrets gateway.
