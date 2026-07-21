# PRD — FAMEU (Film Audition & Talent Hiring App)

> CKR Technologies · Product Requirements Document
> **Version:** v1.1 · **Date:** 19 Jul 2026 · **Client:** Harrsh Pandey
> Companion docs: `SCREEN-MAP.md` v1.1 · `DESIGN.md` v1.1 · `API.md` v1.1 · `AGENTS.md` v1.1 · `SCHEMA.md` v1.1 · `AUTH-MATRIX.md` v1.1 · `INTEGRATIONS.md` v1.1 · `JOBS.md` v1.1 · `DEPLOYMENT.md` v1.1
>
> This document is the single source of truth for *what* we are building and *why*. The Screen Map is the source of truth for *which screens*, DESIGN.md for *how it looks*, API.md for *what data exists*. Where this PRD and a companion doc disagree, the companion doc wins for its domain and this PRD is corrected.
>
> **v1.1 (19 Jul 2026):** name confirmed **FAMEU**; split into **two separate apps** (FAMEU Artist + FAMEU Hiring, no role selection — L11); auth changed to **email-OTP only**, phone/SMS removed (L12). Screen count 72 → 79 (per-app auth stacks).

---

## 1. Product Summary

FAMEU is a two-sided marketplace for the film, media, entertainment, and creator industry in India, delivered as **two separate mobile apps** plus a web admin panel. **Artists** use the **FAMEU Artist app** to build professional portfolios and apply to auditions for free. **Hiring users** (production houses, casting agencies, individual casting directors, talent managers, event organisers, ad agencies, OTT teams) use the **FAMEU Hiring app** to discover talent, post auditions, and manage hiring — after passing a mandatory verification process designed to keep fake auditions and casting scams off the platform.

The commercial model is deliberately low-friction: artists pay nothing; hiring users pay a flat ₹10 per audition post / casting listing. Trust — not transaction fees — is the moat, enforced through document verification, an admin approval queue, verified badges, fraud reporting, and blacklisting.

Platforms at launch: **two Android + iOS apps** (FAMEU Artist, FAMEU Hiring — React Native, one shared codebase/monorepo with per-app entry points and shared UI) plus a **web Admin Panel** (React + Vite). Because the two audiences are on different apps, there is **no in-app role selection** — the app a user downloads determines their role.

### 1.1 Problem being solved

Aspiring and working artists in India rely on WhatsApp groups, Instagram DMs, and word-of-mouth to find auditions — channels rife with fake casting calls, exploitation, and no verification of who is actually hiring. Casting teams, conversely, have no single structured place to source categorised, filterable talent with real portfolios. FAMEU gives both sides a verified, structured, searchable home with scam prevention built into onboarding rather than bolted on.

### 1.2 Naming note

The BRD was an ArgosMob proposal titled "Film Industry Audition & Talent Hiring App." The client-confirmed product name is **FAMEU**, shipped as two apps: **FAMEU Artist** and **FAMEU Hiring** (PRD L8).

---

## 2. Goals & Non-Goals

### 2.1 Goals (what success looks like)

- An artist can register, pick a category, complete a category-specific profile with media, and apply to a relevant audition in under 10 minutes end-to-end.
- A hiring user cannot post a single audition until they have cleared verification — no exceptions, no "verify later."
- Every audition an artist sees is attributable to a verified company; fake/suspect listings are reportable and removable within the admin SLA.
- Payments (₹10/post) are webhook-confirmed server-side; a post never goes live on an unconfirmed payment.
- Real-time chat lets a casting team and a shortlisted artist coordinate without leaving the app or exchanging personal numbers prematurely.

### 2.2 Non-Goals (explicitly out of scope for v1)

- No video-call / live-streamed auditions inside the app (audition *coordination* only; the audition itself happens over the listed venue/instructions or external tools).
- No payment *to artists* through the platform (FAMEU is not a payroll/escrow product; compensation is arranged off-platform, listed only as info on the audition).
- No AI matching/recommendation engine in v1 (the "personalised feed" is rule-based: proximity + category + recency, not ML). Recorded as a Phase 2 candidate.
- No web app for artists or hiring users — both audiences are mobile-only (two native apps). Only the Admin Panel is web.
- No multi-language app UI in v1 (English UI; "Languages Known" is profile data, not app localisation). Strings are externalised from day one so localisation is a later config, not a rewrite.

---

## 3. Users & Roles

| Role | App | Auth | Pays? | Core job |
|---|---|---|---|---|
| **Artist** | **FAMEU Artist** (Android/iOS) | Email OTP + email/password + social | No | Build portfolio, discover & apply to auditions, chat when shortlisted |
| **Hiring user** | **FAMEU Hiring** (Android/iOS) | Email OTP + email/password + social | ₹10 / post | Verify company, post & manage auditions, search talent, shortlist, chat, pay |
| **Admin** | Web (React + Vite) | Email + password + 2FA | — | Verify companies, moderate auditions, handle fraud reports, manage blacklist, view analytics |

Each mobile user exists in exactly one app; there is no role switching or role selection inside an app. Auth is **email-based OTP** (no phone/SMS OTP) — see PRD L4.

Artist sub-categories (each drives a different registration form): Actor, Singer, Model, Dancer, Voice Artist, Musician, Influencer, Anchor, Writer, Director, Editor, Cinematographer, Makeup Artist, Stylist, Technician, Background Artist.

Hiring sub-types (share one flow, differ by label + which doc set applies): Production House, Casting Agency, Individual Casting Director, Talent Manager, Event Organizer, Ad Agency, OTT Production Team.

Full role × action permissions are in `AUTH-MATRIX.md`.

---

## 4. Feature Areas (the "what")

### 4.1 Artist onboarding & profile
Email-OTP registration (email/password + social secondary), then category selection, then a **category-specific dynamic form**. Actor, Singer, Model, Dancer, and Technician have distinct field sets (see Screen Map + Schema); remaining categories reuse the closest base form with category tags. Profile carries a photo gallery, video portfolio (intro / monologue / performance), resume, skills/experience timeline, category tags, and a **public shareable profile link**. Verification is optional for artists (mobile + email always; government ID optional) and grants a Verified Artist badge.

### 4.2 Audition discovery (artist side)
Browse/search auditions by city, category, language, production house, role type; list **and** map view (Google Maps). Trending auditions (most-viewed/applied), an upcoming-audition calendar (applied/saved), and a dedicated walk-in listings view sorted by date + proximity. Audition detail carries role/character requirements, age/gender criteria, venue with maps navigation, date/time, compensation, required documents, and instructions. Apply = confirm with portfolio selection + optional specific intro video/cover note.

### 4.3 Company verification & anti-scam (the trust core)
A hiring user must upload Aadhaar, PAN, and company registration document (GST optional), pass email OTP verification + a selfie/face check, then wait in an **admin approval queue**. Only after admin approval can they post. Approved companies get a Verified badge. Every audition is reportable ("Report Fraudulent Audition"); admins can warn/suspend/blacklist and manage a blacklist with an audit trail. This is the product's reason to exist — it is never optional, never "MVP-cut."

### 4.4 Audition management (hiring side)
Post/edit/pause/delete auditions; view applicants per audition; open full artist profile; shortlist / reject / schedule interview slot; send interview notifications; search talent with advanced filters (category, location, age, gender, language, experience, physical features); featured artist listings.

### 4.5 In-app real-time chat *(locked IN for v1 — see §9)*
Direct real-time messaging between a hiring user and an artist, gated to open only after a **communication request** is accepted (or after shortlisting), so artists aren't cold-messaged. Built on Supabase Realtime. This is deliberately scoped now (not Phase 2) per the client decision on 19 Jul 2026. It adds a chat list + chat thread screen on both mobile apps, a `conversations`/`messages` table pair with RLS, and a realtime channel — accounted for in Screen Map, Schema, and API.

### 4.6 Notifications
Push (audition alerts, application status changes, interview calls, new-match alerts, chat messages, admin messages). Notifications are asked for only after a moment of value (first application submitted), never on first launch.

### 4.7 Payments (hiring side)
₹10 per audition post / casting listing via Cashfree or Razorpay. Server creates the payment order, gateway returns a session, the app completes payment, and **a webhook confirms status server-side before the audition goes live**. Transaction history + posting-credit view. Client-reported success is never trusted. See `INTEGRATIONS.md`.

### 4.8 Admin panel (web)
Dashboard metrics, user/artist management, company verification queue, verified-companies list, blacklist management, audition moderation, fraud reports, payment monitoring, analytics/reports, content management (banners/FAQs/terms/privacy), and admin account/role management.

---

## 5. Key Flows (happy paths)

1. **Artist first run (Artist app):** Splash → Onboarding → Email OTP register → Category select → dynamic form + media upload → Home feed → open audition → Apply → (later) push: "Shortlisted" → chat opens.
2. **Hiring first run (Hiring app):** Splash → Onboarding → Email OTP register → Company registration → **verification upload** → Verification Pending → (admin approves) → Dashboard → Post Audition form → **Pay ₹10** → webhook confirms → audition live → applicants arrive → shortlist → schedule interview → chat.
3. **Admin verify:** Admin login (2FA) → Verification Queue → open company docs → approve/reject with reason → company notified → (if fraud later) Fraud Reports → suspend/blacklist with audit trail.

---

## 6. Non-Functional Requirements

- **Trust/security:** RLS on every table; role-based access; encrypted media at rest (Supabase Storage); OTP-verified auth; activity/audit logs on admin actions and on verification decisions; document uploads (Aadhaar/PAN) access-restricted to admins only, never exposed to other users or in artist-facing responses.
- **Payments integrity:** webhook signature verification; idempotent payment status writes; no audition goes live on client callback alone.
- **Performance:** discovery lists paginate (FlashList), image/video thumbnails via CDN; map view lazy-loads markers by viewport.
- **Availability:** dev + staging + prod Supabase projects; API versioned at `/api/v1`; Sentry error monitoring; nightly DB backup with restore tested.
- **Compliance:** Indian IT/data-protection posture; Aadhaar handling minimised (store only what's needed for verification, restrict access, support deletion on account delete).
- **Store requirements:** account deletion flow in-app (both roles); permission pre-explainers before OS prompts; privacy policy hosted and linked.

---

## 7. Tech Stack (CKR house stack — replaces the BRD's stack)

| Layer | Technology |
|---|---|
| Mobile | React Native (bare CLI, 0.86.0), plain JavaScript (JSDoc, no TypeScript) — **two apps** (FAMEU Artist, FAMEU Hiring) sharing a monorepo: shared `ui`/`theme`/`api` packages, two app entry points |
| Mobile state/data | Redux Toolkit slices + RTK Query |
| Admin panel | React + Vite SPA (static-served via Nginx) |
| Backend | Express.js (Domain-Driven structure) + Supabase (Postgres, Auth, Storage, Realtime, RLS) |
| Payments | Cashfree / Razorpay (webhook-verified) |
| Realtime (chat) | Supabase Realtime |
| Maps | Google Maps (navigation + map view) |
| Infra | CKR VPS behind Nginx; Supabase managed Postgres; CDN for media |

> The BRD proposed React Native + Node/Express + PostgreSQL + AWS/DO. CKR standardises this to the house stack above: Supabase (not raw Postgres/AWS), RTK Query, bare-CLI RN in plain JS, and Cashfree/Razorpay. This is a stack re-baseline, not a scope change.

---

## 8. Scope, Phasing & Commercials

**In scope for v1 (MVP = full BRD scope, per client decision):** all 68 screens across the four modules, in-app chat, payments, full verification/anti-scam, admin panel.

**Phase 2 candidates (recorded, not built now):** ML-based recommendation feed; in-app video auditions; app UI localisation; artist-side web app; GST-mandatory verification tier.

Commercials (timeline, cost, payment terms, team, SLA, warranty) are governed by the **CKR proposal/SOW**, not this PRD. The ArgosMob figures in the source BRD (₹5,00,000 / 4 months / ArgosMob team & SLA) do **not** carry over — CKR issues its own SOW. This PRD deliberately does not restate a price so the two never drift.

---

## 9. Locked Decisions

Recorded so docs stay the single source of truth over chat history. Each has a date and rationale.

| # | Decision | Date | Rationale |
|---|---|---|---|
| L1 | **Full BRD scope is the MVP** — all 68 screens, nothing deferred to Phase 2 except §8 items. | 19 Jul 2026 | Client instruction. |
| L2 | **In-app real-time chat is built in v1**, not Phase 2. | 19 Jul 2026 | Client instruction; adds chat screens + `conversations`/`messages` tables + Supabase Realtime. |
| L3 | **Stack re-baselined to CKR house stack** (RN bare CLI/plain JS, RTK Query, Supabase, Cashfree/Razorpay, React+Vite admin). BRD's AWS/DO/raw-Postgres stack dropped. | 19 Jul 2026 | CKR delivery standard. |
| L4 | **Auth = email OTP** for artist & hiring; email/password + social secondary. **No phone/SMS OTP.** Admin = email+password+2FA. | 19 Jul 2026 | Client instruction (19 Jul 2026): email-only verification. Removes the SMS/phone-OTP integration entirely. |
| L5 | **Chat is gated** — opens only after a communication request is accepted or the artist is shortlisted; no cold DMs. | 19 Jul 2026 | Anti-harassment / trust posture consistent with the app's reason to exist. |
| L6 | **Verification is mandatory and blocking** for hiring users; posting is impossible pre-approval. Artist verification stays optional. | 19 Jul 2026 | Core anti-scam requirement from BRD. |
| L7 | **Payment gates go-live** — an audition is `draft`/`pending_payment` until the payment webhook confirms; never live on client callback. | 19 Jul 2026 | Payment integrity house rule. |
| L8 | **Product name = FAMEU** (Artist app + Hiring app). | 19 Jul 2026 | Client-confirmed final name (19 Jul 2026). |
| L11 | **Two separate mobile apps** — FAMEU Artist and FAMEU Hiring — not one app with role selection. Shared monorepo (shared `ui`/`theme`/`api`), two entry points. **No role-selection screen.** | 19 Jul 2026 | Client instruction; each audience installs its own app. |
| L12 | **Email-OTP only** — no phone number field in auth, no SMS provider. Phone may still be collected as profile/contact data, but never as an auth factor. | 19 Jul 2026 | Client instruction. |
| L9 | **Commercials live in the CKR SOW, not the PRD**; ArgosMob's ₹5L/4-month figures do not carry over. | 19 Jul 2026 | Avoid price drift across docs; CKR issues its own quote. |
| L10 | **Doc set = Core 5 + full Tier 2** (Schema, Architecture notes, Auth-Matrix, Integrations, Jobs, Deployment). Tier 3 (AI) not created — no AI feature in v1. | 19 Jul 2026 | Client instruction; matches project complexity (multi-role, payments, integrations). |

---

## 10. Open Questions (need client input before/at build)

1. Cashfree **or** Razorpay as primary gateway? (INTEGRATIONS.md is written to support one primary; pick before backend payments phase.)
2. Payment on **every** post vs a prepaid credits pack (BRD implies per-post ₹10; confirm no bundle pricing).
3. Do walk-in auditions also cost ₹10, or are they free to encourage volume? (Assumed ₹10, same as scheduled, until told otherwise.)
4. Aadhaar storage: full document image retained, or verified-and-discarded (store only a verification flag + last-4)? Recommend the latter for data-minimisation — needs client call.
5. Featured artist / featured audition listings — is "featured" a paid placement (extra revenue) or an admin-curated free slot? Affects payments + admin panel.

---

## 11. Sign-Off

Build does not start until this PRD **and** `SCREEN-MAP.md` are signed.

| Party | Name / Role | Signature | Date |
|---|---|---|---|
| Client | Harrsh Pandey | ________________ | ________ |
| CKR Technologies | ______________ — Delivery Lead | ________________ | ________ |
