# INTEGRATIONS.md — FAMEU Third-Party Services

> CKR Technologies · **Version:** v1.1 · **Date:** 19 Jul 2026
> Every external service: what it's for, how it authenticates, which endpoints/webhooks we use, retry/idempotency rules. Agents can't infer a gateway's webhook rules from our codebase — they come from here. Companion: `API.md` §9, `SCHEMA.md`, `DEPLOYMENT.md`.

Secrets rule: every key below is read **only** through `src/config/secrets.js` and handed to the one domain that needs it (payments → gateway keys, auth → JWT/OTP). No other file touches `process.env`. ESLint `no-restricted-properties` enforces this.

---

## 1. Payments — Cashfree / Razorpay

**Purpose:** ₹10 per audition post (PRD §4.7). One primary gateway chosen at build (open question — PRD §10.2); the abstraction below is gateway-agnostic so the second can be added later.

**Flow (server-authoritative):**
1. App calls `POST /payments/order` → payments domain creates a gateway order (amount 1000 paise), stores a `payments` row `status=created` with a unique `idempotency_key`, returns the gateway `paymentSession`.
2. App completes payment via the gateway's RN SDK (never our own card form — PCI stays with the gateway).
3. Gateway calls `POST /webhooks/payments` → we **verify the signature**, then idempotently mark the `payments` row `paid`/`failed` on `gateway_order_id`, and on `paid` flip the linked audition `pending_payment → active`.
4. App confirms by polling `GET /payments/:id` or via the push sent after the webhook. The **client callback is never trusted** to activate anything (PRD L7).

**Auth:** gateway API key + secret (server-side only). Webhook verified via the gateway's signature scheme (HMAC over the raw body with the webhook secret).

**Rules:**
- Webhook endpoint is public (no app JWT) but **rejects any request failing signature verification** (`WEBHOOK_SIGNATURE_INVALID`), reads the **raw** body (no JSON middleware mutating it before verification).
- Idempotent: a repeated webhook for an already-processed order returns 200 without re-applying (`PAYMENT_ALREADY_PROCESSED` internally, 200 externally so the gateway stops retrying).
- Amount + currency validated against `app_config.post_price_paise` server-side; never trust the amount echoed by the client.
- Test mode keys in dev/staging, live keys only in prod (`DEPLOYMENT.md`).

---

## 2. Supabase

**Purpose:** Postgres + Auth + Storage + Realtime + RLS — the backbone.
- **Auth:** email OTP (primary), email/password, social (Google/Facebook) via Supabase Auth — **no phone/SMS OTP** (PRD L12); JWT verified by Express middleware on every non-public route.
- **Storage:** two buckets — `public-media` (portfolio photos/videos/audio/resume/logos) and `private-docs` (Aadhaar/PAN/company reg/selfie). Private bucket access only via short-lived signed URLs issued to admins during verification review.
- **Realtime:** chat channels `conversation:<id>`, RLS-scoped to the two participants (SCHEMA + AUTH-MATRIX). Broadcast only; message writes still go through `POST /messages`.
- **Access:** service-role key server-side only (via secrets gateway); the app uses the anon key + user JWT, never the service key.

---

## 3. Google Maps

**Purpose:** audition venue map view + navigation (A-14 map toggle, A-19 detail), geo-filtering "nearby auditions."
- Mobile: `react-native-maps` (Google provider) for map view; hand off to the native maps app for turn-by-turn navigation.
- Geocoding of venue address → lat/lng at audition-post time (H-7), stored on the audition so discovery doesn't geocode on every read.
- **Auth:** Google Maps API key, restricted per platform (Android/iOS bundle-id restricted; a separate server key for geocoding). Keys via secrets gateway; never the same key client + server.

---

## 4. Push notifications (FCM)

**Purpose:** audition alerts, application status, interview calls, new-match, chat message, verification result, admin messages (PRD §4.6).
- Firebase Cloud Messaging (Android + iOS via APNs under FCM). Device token registered via `POST /me/push-token` **after** the first value moment (first application / first post), never on launch.
- Server sends through FCM Admin SDK from the notifications domain. A notification row is always written to DB (`notifications` table) whether or not the push delivers — the in-app Notifications screen is the source of truth.
- **Auth:** FCM service account JSON via secrets gateway.

---

## 5. OTP — Email (no SMS)

**Purpose:** email OTP for artist + hiring auth (PRD L4/L12). **There is no phone/SMS OTP and no SMS provider** — this removes an entire integration and its cost/deliverability risk.
- Path: Supabase Auth email OTP (magic-code), sent via the configured transactional email sender. If deliverability needs a dedicated provider (e.g. Resend/SES/Postmark) it slots in here as Supabase's custom SMTP — decide during backend build; the app contract (`/auth/otp/*`, email only) is unchanged.
- Rate-limited server-side (`OTP_RATE_LIMITED`), 30s resend. 6-digit code; user can paste from their email client (no SMS Retriever / auto-read).
- **Two apps, one sender:** both FAMEU Artist and FAMEU Hiring use the same email-OTP backend, distinguished by the `X-App` header; templates may be branded per app.

---

## Retry & failure posture (all integrations)

- Outbound calls (FCM, geocoding, gateway order creation) wrapped in try/catch with a bounded retry (max 3, exponential backoff); failures logged to Sentry, never a silent swallow.
- A failed push is not a failed action — the DB notification still exists.
- A failed geocode blocks the post with a clear error ("Couldn't locate that venue, check the address"), never posts an audition with no coordinates.
- Payment webhook is the only integration allowed to change money/go-live state, and only after signature verification.

## Open items (mirror PRD §10)
- Cashfree vs Razorpay as primary — pick before payments build.
- Aadhaar retention model affects whether `private-docs` keeps the full image or only a verification flag.
