# AUTH-MATRIX.md — FAMEU Permissions

> CKR Technologies · **Version:** v1.1 · **Date:** 19 Jul 2026
> RLS policies and route middleware are written **from this table**. Guessing here = security holes. Roles: `artist`, `hiring` (a verified or unverified company user), `admin` (with sub-roles super/moderator/finance). Artist and hiring are on **two separate apps** (PRD L11); an account is bound to one app and role (`WRONG_APP` on cross-login). Auth is **email-OTP only** (PRD L12). Companion: `SCHEMA.md`, `API.md`.

## Legend
✅ allowed · ❌ denied · 🔶 conditional (condition in the cell) · — not applicable

## Core actions

| Action | Artist | Hiring (unverified) | Hiring (verified) | Admin |
|---|---|---|---|---|
| Register / login (email OTP) | ✅ Artist app | ✅ Hiring app | ✅ Hiring app | ✅ web (2FA) |
| Complete own profile | ✅ | ✅ | ✅ | — |
| Upload own media | ✅ | ✅ (docs) | ✅ | — |
| Submit company verification | — | ✅ | 🔶 re-submit if rejected | — |
| **Post an audition** | ❌ | ❌ `COMPANY_NOT_VERIFIED` | 🔶 after payment webhook confirms | ❌ |
| Edit/pause/close own audition | — | ❌ | ✅ own only | ✅ (moderation) |
| Browse/search auditions | ✅ | ✅ | ✅ | ✅ |
| View audition detail | ✅ | ✅ | ✅ | ✅ |
| Apply to audition | ✅ 🔶 one per audition | ❌ | ❌ | ❌ |
| View own applications | ✅ | — | — | ✅ (all) |
| View applicants to own audition | — | ❌ | ✅ own audition only | ✅ (all) |
| Shortlist/reject/schedule applicant | — | ❌ | ✅ own audition only | ❌ |
| Search talent (artists) | ❌ | 🔶 read-only, limited | ✅ | ✅ |
| View artist full contact | ❌ | ❌ | 🔶 only after comm-request accepted / shortlist | ✅ |
| Send communication request | — | ❌ | ✅ | — |
| Accept/decline comm-request | ✅ | — | — | — |
| **Open chat with peer** | 🔶 only if conversation exists (accepted request / shortlisted) | ❌ | 🔶 same gate | ❌ (read for moderation only) |
| Send message | 🔶 own conversations | ❌ | 🔶 own conversations | ❌ |
| Pay ₹10 / view own transactions | — | 🔶 can pay to activate a post | ✅ | ✅ (view all) |
| Report fraudulent audition | ✅ | ✅ | ✅ | — |
| Save audition / calendar | ✅ | — | — | — |
| Delete own account | ✅ | ✅ | ✅ | 🔶 super only |

## Verification & documents

| Action | Artist | Hiring | Admin (moderator+) |
|---|---|---|---|
| Read own submitted docs | ❌ (write-only once submitted) | ❌ | ✅ (signed URL, during review) |
| Read another user's docs (Aadhaar/PAN) | ❌ | ❌ | ✅ |
| Approve/reject company | ❌ | ❌ | ✅ |
| Grant/revoke artist verified badge | ❌ | ❌ | ✅ |

Documents are **never** returned in artist- or hiring-facing responses under any condition. Only admin verification endpoints expose a short-lived signed URL, logged in `audit_logs`.

## Admin sub-roles

| Action | super | moderator | finance |
|---|---|---|---|
| Company verification queue / decisions | ✅ | ✅ | ❌ |
| Audition moderation / fraud actions | ✅ | ✅ | ❌ |
| Blacklist add/remove | ✅ | ✅ | ❌ |
| Payment monitoring / export | ✅ | ❌ | ✅ |
| Analytics & reports | ✅ | ✅ | ✅ |
| Content management | ✅ | 🔶 non-legal only | ❌ |
| Manage admin accounts/roles | ✅ | ❌ | ❌ |
| Delete a user account | ✅ | ❌ | ❌ |

## Enforcement notes

- Two layers, always both: **route middleware** (role + verification gate) *and* **RLS** (ownership at row level). Neither alone is sufficient.
- The posting gate is checked at `POST /auditions` (middleware → `COMPANY_NOT_VERIFIED`) *and* the audition can't reach `active` without a confirmed payment (webhook only) — belt and suspenders per PRD L6/L7.
- Chat RLS: a `messages` row is readable only if `auth.uid()` is one of the two `conversations` participants. No conversation = no possible message access.
- Blacklisted user/company: `403 BLACKLISTED` at login and on every mutating route; existing content hidden from discovery.
- Every admin mutating action writes an immutable `audit_logs` row (who/what/why/when).
