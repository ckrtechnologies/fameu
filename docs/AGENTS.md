# AGENTS.md — FAMEU (Mobile + Backend Repo)

> CKR Technologies · React Native (bare CLI) + Express/Supabase
> Read automatically at the start of every Antigravity session. This is the agent's rulebook — design comes from `docs/DESIGN.md`, data from `docs/API.md`, schema rationale from `docs/SCHEMA.md`, behavior from here.
> **Version:** v1.1 · **Date:** 19 Jul 2026.

---

## 1. Project Context

- **Project:** FAMEU — Film Audition & Talent Hiring platform: **two separate mobile apps** (FAMEU Artist, FAMEU Hiring) + web admin (PRD L11). Shared monorepo — see ARCHITECTURE.md frontend section (`apps/artist`, `apps/hiring`, `packages/shared`).
- **Client:** Harrsh Pandey. **Name is final: FAMEU** (PRD L8).
- **Two apps, not one with roles:** there is **no role-selection screen**; the app a user installs is their role. Never build a role picker or merge the two apps.
- **Screen Map:** `docs/SCREEN-MAP.md` v1.1 — build only what's listed. New screens = change request, not silent addition.
- **PRD:** `docs/PRD.md` v1.1. **API:** `docs/API.md` v1.1. **Schema:** `docs/SCHEMA.md` v1.1.
- **Permissions:** `docs/AUTH-MATRIX.md` v1.1. **Integrations:** `docs/INTEGRATIONS.md` v1.1. **Jobs:** `docs/JOBS.md` v1.1. **Deploy:** `docs/DEPLOYMENT.md` v1.1. **Architecture:** `docs/ARCHITECTURE.md` v1.1.
- **Roles in this app:** artist, hiring (company), admin (sub-roles super/moderator/finance).
- **The product's reason to exist is trust/anti-scam.** When a tradeoff pits convenience against verification/trust integrity, trust wins — flag it, don't quietly weaken a gate.

---

## 2. Stack & Versions

- React Native bare CLI (0.86.0) — **never** Expo or expo-* packages. New Architecture/Fabric is on (default since 0.82).
- **Monorepo, two apps:** `apps/artist` + `apps/hiring` + `packages/shared` (theme, ui, api base, auth, chat). App-specific domains stay in their app; shared code never imports app-specific code. Both apps send an `X-App: artist|hiring` header on every request.
- **Plain JavaScript only** (.js/.jsx) — never TypeScript/.tsx. Use JSDoc `@param`/`@returns` for editor hints.
- Navigation: `@react-navigation/native` (native-stack + bottom-tabs).
- State/data: **Redux Toolkit** — RTK slices (client state) + **RTK Query** (all server data).
- Backend: Express.js (DDD per `docs/ARCHITECTURE.md`) + Supabase (Postgres, Auth, Storage, Realtime), accessed through the domain repository layer — never `supabase.from()` inside a screen/component.
- Admin panel: React + Vite SPA.
- Styling: **NativeWind** — no other styling library.
- Do not add an npm dependency without listing it and asking first, except the libraries already named in `docs/DESIGN.md` §11.

---

## 3. Design Rules (non-negotiable)

1. Before writing/modifying any UI, read `docs/DESIGN.md` in full.
2. Never use raw hex, literal px font sizes, or arbitrary spacing/radius. Always import from `src/theme/` (`colors`, `typography`, `spacing`, `radius`, `motion`).
3. If a screen needs a value not in `src/theme/`, stop and propose adding it to `DESIGN.md` §1 — never invent a one-off.
4. Every data-fetching screen implements all 4 states (DESIGN.md §4): loading skeleton, empty, error+retry, offline. No blank screens, no missing retry.
5. Every interactive component implements all applicable states (DESIGN.md §3): default, pressed, disabled, loading. Buttons never change width in loading state.
6. Only the libraries mapped in `DESIGN.md` §11 for animation/gestures/images/lists/sheets/haptics/blur/icons/maps/video/realtime — no substitutes, no RN `Animated`/`PanResponder`.
7. Reuse a `src/components/ui/` component before building a new one; if none fits, build it in `ui/` first, then use it.
8. Copy follows DESIGN.md §6 (sentence case, verb+object buttons like "Pay ₹10"/"Apply now", no raw error codes) and comes from the strings file, never hardcoded.
9. Min touch target 44×44. Safe areas via `react-native-safe-area-context`. Keyboard via `react-native-keyboard-controller` on every input screen (esp. the long category registration forms).
10. Before marking a screen complete, self-check against `DESIGN.md` §10 and report which boxes pass — including the trust-state row (verified/fraud/pending use standard tokens + icons).

---

## 4. API & Data Rules

1. All network/data calls go through each domain's RTK Query endpoint file — never `fetch`/`axios`/`supabase.from()` in a screen. (Exception: Supabase Realtime **chat subscription** read-side, which is RLS-scoped; message sends still go through `POST /messages`.)
2. The contract is `docs/API.md`. Do not invent an endpoint, field, or response shape not listed. Missing something → stop and ask, never guess.
3. All mutating requests show a loading state on the trigger and are disabled while in flight — **never a double-submit**. Critical on **Pay ₹10** (double charge) and **Apply** (duplicate application; also DB-guarded by UNIQUE(audition_id, artist_id)).
4. Audit-sensitive rows (`verifications`, `payments`, `blacklist`, `audit_logs`, application status history) are **never edited or hard-deleted** — append status/history only. Enforce in UI (no edit button after submit) and flag any task implying otherwise.
5. Respect offline behavior from DESIGN.md §4: disable posting/applying/paying offline; keep cached feed/profile browsable; queue where specified.
6. **Sensitive documents (Aadhaar/PAN/company docs/selfie) are admin-only** — never render, request, or log them in artist/hiring flows. They appear only in admin verification via short-lived signed URL.

---

## 5. Code Conventions

- Plain JavaScript (no TS). JSDoc on shared functions and API response shapes.
- Naming: PascalCase components, camelCase functions/vars, kebab-case non-component file names, PascalCase component file names.
- No inline styles for token-covered values (color/spacing/type/radius); inline objects only for one-off layout math.
- One component per file. Screens in `src/domains/<domain>/screens/{ScreenName}/index.jsx`; shared UI in `src/shared/components/ui/`.
- Every async call wrapped in try/catch or RTK Query's error state — never an unhandled rejection.
- Domain isolation: a domain imports only from itself and `shared/` — never into another domain's internals (ARCHITECTURE.md).

---

## 6. Backend Rules

- Pattern per domain: `routes → controller → service → repository` (+ `validation`). Controllers thin; logic in services; only the repository touches that domain's tables.
- Every route validates input with `joi` before touching the DB. Validation failures → `422 VALIDATION_FAILED` with `error.fields`.
- Standard response: `{ success, data? , error? { code, message } }`.
- **RLS mandatory on every table** — no table ships without a policy, including reference and admin tables. Two-layer auth: middleware (role + verification gate) **and** RLS (row ownership).
- Migrations are the only way schema changes happen; never alter tables via the dashboard on a shared project. Never modify an applied migration — add a new one.
- **Secrets:** only `src/config/secrets.js` reads `process.env`; scoped exports to the domain that needs each key. ESLint `no-restricted-properties` bans `process.env` elsewhere.
- **Payments:** gateway order server-side; **webhook signature-verified**; payment status + audition go-live set **only** by the webhook, idempotently; client callback never trusted (INTEGRATIONS.md §1, PRD L7).
- **Verification gate:** `POST /auditions` returns `COMPANY_NOT_VERIFIED` until approved; audition can't reach `active` without a confirmed payment (AUTH-MATRIX + PRD L6/L7).
- Auth: **email OTP** (artist/hiring — no phone/SMS, PRD L12), email+password+2FA (admin) — see API.md §1 for exact contracts. Role is derived server-side from the `X-App` header, not a client-supplied field; cross-app login returns `WRONG_APP`.

---

## 7. What the Agent Must Never Do

- Never commit secrets, API keys, or `.env` contents; never read `process.env` outside `src/config/`.
- Never modify an applied migration — write a new one.
- Never change `src/theme/` values without the matching `DESIGN.md` §1 change in the same PR (and flag it).
- Never skip/silence an ESLint/PropTypes warning to make a build pass.
- Never render, request, log, or return **Aadhaar/PAN/company documents** in any artist- or hiring-facing path.
- Never let a hiring user post before verified, and never let a client callback (not the webhook) flip an audition live.
- Never open a chat/conversation that isn't gated by an accepted comm-request or a shortlist (PRD L5).
- Never add a role-selection screen or merge the two apps; never add phone/SMS OTP (auth is email-only — PRD L11/L12).
- Never add a screen, field, or endpoint not in `docs/SCREEN-MAP.md` / `docs/API.md` without flagging it first.
- Never edit or hard-delete an audit-sensitive row after submit.

---

## 8. When the Agent Is Unsure

If a task is ambiguous — a missing field, an unclear navigation target, a design value not in tokens, a permission not in AUTH-MATRIX — **stop and ask a specific question** rather than guessing a plausible default. Per DESIGN.md's closing rule: *"Anything that violates this document is a bug, even if it looks fine."* A wrong guess that looks fine is worse than a paused task — especially on anything touching payments, verification, or document handling.
