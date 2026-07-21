# SCHEMA.md — FAMEU Data Model

> CKR Technologies · Supabase (Postgres) · **Version:** v1.1 · **Date:** 19 Jul 2026
> Explains *why* the schema is shaped this way so agents don't "fix" intentional decisions. Migrations are the source of truth for *what*; this is the source of truth for *why*. Derived from `SCREEN-MAP.md` §7 and `API.md`.

## Design principles

- **RLS on every table, no exceptions** — including reference tables (read-only public policy) and admin tables (admin-role policy). No table ships without a policy.
- **Audit-sensitive rows are immutable post-write** — `verifications`, `blacklist`, `payments`, `audit_logs`, `applications` history: corrections are new status rows, never in-place edits or hard deletes. Matches the process rule on audit-sensitive apps.
- **Media lives in Supabase Storage**, DB holds only `media` metadata rows + the storage path. Sensitive docs (Aadhaar/PAN/company reg/selfie) sit in a **private bucket** readable only via short-lived signed URLs issued to admins during review.
- **Role is on `users`** and is fixed at signup by the app used (Artist app → `artist`, Hiring app → `hiring`; PRD L11) — there is no in-app role switch. Profile detail is split into `artists` / `companies` (1:1 with a user) so the two very different shapes don't bloat one table.
- **Email is the auth identifier** (email-OTP only, PRD L12); `phone` is optional contact/profile data, never used for auth or OTP.
- **Money in paise (int)** to avoid float rounding.
- Soft-delete via `deleted_at` on user-facing content; hard delete only through the retention job for purged media.

## ERD (text)

```
users (id, role, email, phone?, password_hash?, status, created_at, deleted_at)
        -- email is the auth identifier (email-OTP only, PRD L12); phone is optional contact data, never an auth factor.
        -- role is fixed at signup by which app created the account (PRD L11); one account = one app.
  ├─1:1─ artists (user_id FK, category_id FK, subcategory_id FK?, fields jsonb, city_id FK?,
  │               travel_availability, verified_badge bool, share_slug uniq, created_at)
  │        └─1:N─ artist_media (id, artist_id FK, media_id FK, kind, position)
  ├─1:1─ companies (user_id FK, type_id FK, name, contact jsonb, socials jsonb, description,
  │               logo_media_id FK?, verification_status enum, created_at)
  │        ├─1:N─ company_documents (id, company_id FK, doc_type, media_id FK[private])
  │        └─1:N─ auditions (id, company_id FK, title, role_description, character_requirements,
  │                          age_min, age_max, gender, category_id FK, language, type,
  │                          date_time, venue jsonb{address,lat,lng}, compensation,
  │                          required_documents jsonb, instructions, status enum, created_at, deleted_at)
  │                 ├─1:N─ applications (id, audition_id FK, artist_id FK, status enum,
  │                 │                    cover_note, created_at)   [UNIQUE(audition_id, artist_id)]
  │                 │        ├─1:N─ application_media (application_id FK, media_id FK)
  │                 │        └─1:N─ application_status_history (application_id FK, status, actor_id, note, created_at)
  │                 └─1:N─ interviews (id, application_id FK, date_time, venue jsonb, note, created_at)
  ├─1:N─ media (id, owner_user_id FK, kind, bucket, path, content_type, size_bytes,
  │             is_private bool, status enum(pending|ready), created_at)
  ├─1:N─ verifications (id, subject_type(artist|company), subject_id, decision enum,
  │                     reason, decided_by FK admins?, submitted_at, decided_at)   [immutable]
  ├─1:N─ comm_requests (id, company_id FK, artist_id FK, message, status enum, created_at)
  ├─1:N─ conversations (id, company_id FK, artist_id FK, created_at)   [UNIQUE(company_id, artist_id)]
  │        └─1:N─ messages (id, conversation_id FK, sender_user_id FK, text, read_at, created_at)
  ├─1:N─ payments (id, company_id FK, audition_id FK?, purpose, amount_paise, gateway,
  │               gateway_order_id, status enum, idempotency_key uniq, created_at)   [status immutable→ append]
  ├─1:N─ notifications (id, user_id FK, type, title, body, data jsonb, read_at, created_at)
  ├─1:N─ fraud_reports (id, audition_id FK, reporter_user_id FK, reason, details, status, created_at)
  └─1:N─ saved_auditions (user_id FK, audition_id FK)   [UNIQUE pair]

admins (id, email, password_hash, role enum(super|moderator|finance), status, created_at)
blacklist (id, target_type(user|company), target_id, reason, created_by FK admins, created_at)   [immutable]
audit_logs (id, actor_admin_id FK, action, target_type, target_id, reason, meta jsonb, created_at)  [append-only]
content (id, key(banners|faqs|terms|privacy), value jsonb, updated_by FK admins, updated_at)

-- reference / seed
categories (id, name, form_schema jsonb)          -- 16 artist categories + per-category field schema
technician_subcategories (id, name)               -- 10
hiring_types (id, name)                            -- 7
languages (id, name)
cities (id, name, state)
app_config (key, value)                            -- e.g. post_price_paise = 1000
```

## Enum reference

- `users.role`: artist | hiring | admin
- `users.status`: active | disabled
- `companies.verification_status`: none | pending | approved | rejected
- `auditions.status`: draft | pending_payment | active | closed | removed
- `auditions.type`: walkin | scheduled
- `applications.status`: pending | shortlisted | rejected | interview_scheduled
- `comm_requests.status`: pending | accepted | declined
- `payments.status`: created | paid | failed
- `verifications.decision`: pending | approved | rejected
- `media.kind`: photo | video | audio | resume | intro | monologue | performance | logo | id_doc | company_doc | selfie
- `admins.role`: super | moderator | finance

## Why certain choices

- **`artists.fields` is jsonb, validated against `categories.form_schema`** — 16 categories with very different fields would be 16 sparse columns or 16 tables otherwise. One jsonb column + a per-category schema keeps it flexible while still validated server-side (never trust client shape). Indexed on common filter fields via generated columns (city, category, gender, age) for talent search performance.
- **`conversations` unique on (company_id, artist_id)** — one thread per pair, created only when a comm-request is accepted or a shortlist happens (PRD L5). No thread can exist without that gate.
- **`payments.idempotency_key` unique** — the same "Pay ₹10" tap retried never double-charges; the webhook is idempotent on `gateway_order_id`.
- **`applications` UNIQUE(audition_id, artist_id)** — enforces `409 ALREADY_APPLIED` at the DB, not just the app.
- **Private media bucket + signed URLs** — Aadhaar/PAN never appear in any normal API response; only `admin/verifications` issues a short-lived signed URL during review. This is the schema-level expression of the anti-scam trust posture and data-minimisation.

## RLS posture (summary; full policies live in migrations)

- `artists`, `companies`, `auditions` (active), `messages` (own conversations): readable per role & ownership.
- Public read: `GET /artists/:id` share profile, `GET /companies/:id`, `GET /auditions/:id` — via a policy exposing only non-sensitive columns (a view), never the base table with docs.
- Private buckets + `company_documents`, `verifications` document access: admin role only.
- Every write policy checks `auth.uid()` ownership; admin writes checked against `admins` + role.

## Migrations & seed

- One migration per logical change; never edit an applied migration — add a new one.
- `seed.sql`: 16 categories with form schemas, 10 technician subcategories, 7 hiring types, a starter language + city list, `app_config.post_price_paise=1000`, and realistic demo rows (a few artists per category, 2–3 verified companies, sample auditions/applications) so every screen renders against real data, not empty states.

## Open items (mirror PRD §10)
- Aadhaar retention: if verified-and-discard, `company_documents` stores only `doc_type + last4 + verified_at`, and the media row is purged by the retention job — decide before writing the verifications migration.
