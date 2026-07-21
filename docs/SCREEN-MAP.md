# SCREEN-MAP — FAMEU

> CKR Technologies · **Version:** v1.1 · **Date:** 19 Jul 2026 · **Client:** Harrsh Pandey
> Companion: `PRD.md` v1.1 · `DESIGN.md` v1.1 · `API.md` v1.1 · `SCHEMA.md` v1.1 · `AUTH-MATRIX.md` v1.1
>
> This is the signed source of truth for **which screens exist**. Build only what is listed here. A new screen/field mid-project is a change request, priced by blast radius (docs + tables + screens it touches), never absorbed silently. The **Data in/out** column is the draft for `API.md` and the Supabase schema.

**Structure:** FAMEU ships as **two separate apps** (PRD L11) — each with its own auth stack, no shared common-auth module, **no role-selection screen**. Auth is **email-OTP only** (PRD L12) — no phone/SMS OTP.

Screen counts: **FAMEU Artist app** = 8 auth + 27 = **35** · **FAMEU Hiring app** = 8 auth + 23 = **31** · **Admin web** = **13** = **79 screens**. (The shared 9-screen common-auth stack from v1.0 is replaced by two per-app 8-screen stacks — Role Selection removed, so 9→8 each.)

---

## App-shell checklist (run explicitly, per CKR process)

| Shell item | Status | Note |
|---|---|---|
| **Splash** | ✅ Both apps | Each app has its own splash: logo reveal + session check on launch (no role routing — the app *is* the role). |
| **Onboarding (≤3 slides)** | ✅ Both apps | 3-slide walkthrough per app, skippable, ends at that app's auth. New concept for most users → kept. |
| **Login / Auth** | ✅ Both apps | Per-app auth stack, **email-OTP only** (no phone/SMS). No role-selection screen. |
| **Empty / Error / Offline states** | ✅ Per screen | Not separate screens; designed per DESIGN.md §4 on every data screen. Called out in AGENTS.md checklist. |
| **Settings / Profile** | ✅ Included | Artist Settings (A-24), Hiring Settings (H-20), Admin Settings (AD-13); profile screens per app. |

No shell item silently omitted. **Role Selection is intentionally removed** — the two-app split (PRD L11) makes it unnecessary; recorded here so its absence is a decision, not an oversight.

---

## 1. Onboarding & Authentication — per app (8 screens each)

Each app (Artist, Hiring) ships its **own** auth stack — same shape, different branding/copy and post-auth destination. **No role-selection screen** (the app determines the role, PRD L11). **Email-OTP only** — no phone number in auth, no SMS (PRD L12). Admin logs in on web (AD-1), not here.

The 8 screens below exist **in each app** — prefixed `AA-` in the Artist app and `HA-` in the Hiring app.

| # | Screen | Purpose | Entry point | Data in / out |
|---|---|---|---|---|
| n-0 | Splash | Logo reveal + session check; route to Onboarding, app home, or (Hiring only) verification-pending. | App launch | in: stored session/JWT → out: navigation target |
| n-1 | Onboarding / Welcome | 3-slide walkthrough of that app's benefits; skippable. | After splash, first launch only | in: — → out: "seen onboarding" flag (local) |
| n-2 | Register — Email | Enter email + password; trigger email OTP. | After onboarding / from login | in: email, password → out: `POST /auth/otp/request` (channel=email) |
| n-3 | Email OTP Verification | 6-digit OTP sent to email; resend timer 30s. | After n-2 | in: otp, email → out: `POST /auth/otp/verify` → session |
| n-4 | Social Login | Google / Facebook; fallback to email register. | Register / login | in: oauth token → out: `POST /auth/social` → session |
| n-5 | Login | Email + password; forgot-password link. | Returning user | in: email, password → out: `POST /auth/login` → session |
| n-6 | Forgot Password | Enter registered email → reset OTP (email). | Login | in: email → out: `POST /auth/password/forgot` |
| n-7 | Reset Password | New + confirm password after email-OTP validation. | After n-6 | in: otp, newPassword → out: `POST /auth/password/reset` |

*(n-0…n-7 = 8 screens per app → **AA-0…AA-7** in Artist, **HA-0…HA-7** in Hiring. 16 auth screens total across the two apps.)*
After AA-7/HA-3 completes: Artist app → A-1 (Category Selection); Hiring app → H-1 (Company Registration).

---

## 2. Artist App (27 screens)

| # | Screen | Purpose | Entry point | Data in / out |
|---|---|---|---|---|
| A-1 | Artist Category Selection | Pick one of 16 categories; drives which form loads. | After first register (Artist) | in: category list → out: chosen `category` |
| A-2 | Actor Registration Form | Dynamic form: name, age, gender, height, weight, body type, skin tone, hair/eye colour, languages, acting experience, portfolio, intro video, monologue, socials, city, travel availability. | A-1 = Actor | in: form fields + media uploads → out: `POST /artists` (+ Storage uploads) |
| A-3 | Singer Registration Form | Genre, vocal range, languages, audio upload, performance video, instruments, experience. | A-1 = Singer | in: fields + audio/video → out: `POST /artists` |
| A-4 | Model Registration Form | Height, weight, measurements, shoe size, portfolio photos, ramp experience, brand history. | A-1 = Model | in: fields + photos → out: `POST /artists` |
| A-5 | Dancer Registration Form | Dance styles, training, performance videos, competition history, certifications. | A-1 = Dancer | in: fields + videos → out: `POST /artists` |
| A-6 | Technician Registration Form | Sub-category selector (editor/cinematographer/makeup/…), experience, resume, equipment, work portfolio. | A-1 = Technician & related | in: subcategory, fields, resume, media → out: `POST /artists` |
| A-7 | Artist Home / Dashboard | Personalised feed: nearby, recommended, trending auditions + profile-completion status. | Post-registration / tab root | in: `GET /auditions/feed?lat&lng`, profile % → out: taps into detail |
| A-8 | Artist Profile (public) | Public profile: photo, intro video, skills, category tags, timeline, shareable link. | Tab / shared link | in: `GET /artists/:id` → out: share link |
| A-9 | Edit Profile | Edit details, replace media, update socials & availability. | A-8 | in: current profile → out: `PATCH /artists/:id` |
| A-10 | Photo Gallery | Grid of portfolio photos; add/delete. | A-8 / A-9 | in: `GET /artists/:id/photos` → out: `POST`/`DELETE /media` |
| A-11 | Video Portfolio | Intro/monologue/performance videos with playback. | A-8 / A-9 | in: `GET /artists/:id/videos` → out: `POST`/`DELETE /media` |
| A-12 | Resume Upload | Upload/replace resume; preview PDF. | A-9 | in: file → out: `POST /media` (resume) |
| A-13 | Verification (Artist) | Optional gov-ID upload; view badge status. | A-24 Settings | in: id doc → out: `POST /verification/artist` → status |
| A-14 | Audition Discovery | Browse/search auditions; filters (city, category, language, house, role type); list⇄map toggle. | Home tab | in: `GET /auditions?filters`, geo → out: taps into A-19 |
| A-15 | Audition Search & Filter | Advanced multi-select filters + date range. | A-14 | in: filter options → out: applied filter set |
| A-16 | Trending Auditions | Most-viewed/applied curated list. | A-14 / Home | in: `GET /auditions/trending` → out: detail |
| A-17 | Upcoming Audition Calendar | Calendar of applied/saved auditions. | Home / A-21 | in: `GET /applications?upcoming`, saved → out: detail |
| A-18 | Walk-In Listings | Walk-in auditions by date + proximity. | A-14 | in: `GET /auditions?type=walkin&geo` → out: detail |
| A-19 | Audition Detail | Full detail: role/character, age/gender, venue + maps nav, date/time, compensation, docs, instructions, Apply. | Any list | in: `GET /auditions/:id` → out: nav to A-20 |
| A-20 | Apply for Audition | Confirm application; select portfolio; optional intro video + cover note. | A-19 | in: auditionId, media refs, note → out: `POST /applications` |
| A-21 | My Applications | All applications with status badges (Pending/Shortlisted/Rejected/Interview). | Tab root | in: `GET /applications?me` → out: detail |
| A-22 | Application Detail | One application + any casting-team response/notification. | A-21 | in: `GET /applications/:id` → out: open chat if unlocked |
| A-23 | Notifications | All push: alerts, status, interview calls, matches, chat. | Tab / bell | in: `GET /notifications` → out: mark read |
| A-24 | Artist Settings | Password, notification prefs, privacy, logout. | Tab root | in: prefs → out: `PATCH /me/settings` |
| A-25 | Delete Account | Confirm deletion with reason. | A-24 | in: reason → out: `DELETE /me` |
| **A-26** | **Chat List** *(new, L2)* | List of unlocked conversations with hiring users. | Tab / A-22 | in: `GET /conversations?me` → out: open thread |
| **A-27** | **Chat Thread** *(new, L2)* | Real-time message thread with one hiring user. | A-26 / A-22 | in: `GET /conversations/:id/messages`, Realtime sub → out: `POST /messages` |

*(A-1…A-27 = 27 screens; A-26/A-27 added by decision L2.)*

---

## 3. Hiring User App — Production House / Casting Agency / Director (23 screens)

| # | Screen | Purpose | Entry point | Data in / out |
|---|---|---|---|---|
| H-1 | Company Registration | Register as house/agency/director/manager/organiser/ad-agency: name, type, contact, socials. | After first register (Hiring) | in: company fields → out: `POST /companies` |
| H-2 | Company Verification | Upload Aadhaar, PAN, company-reg doc, optional GST; selfie/face capture; submit for review. | After H-1 | in: docs + selfie → out: `POST /verification/company` |
| H-3 | Verification Pending | Status after submission; est. review time; blocks posting. | After H-2 | in: `GET /verification/company/status` → out: — |
| H-4 | Company Profile (public) | Logo, description, verified badge, past productions, socials. | Tab / artist view | in: `GET /companies/:id` → out: — |
| H-5 | Edit Company Profile | Edit details, logo, socials. | H-4 | in: current → out: `PATCH /companies/:id` |
| H-6 | Hiring Dashboard / Home | Active auditions, total applications, shortlisted count, quick-post CTA. | Tab root (post-approval) | in: `GET /companies/me/dashboard` → out: taps |
| H-7 | Post New Audition | Form: title, role, character reqs, age/gender, category, language, type (walk-in/scheduled), date/time, venue + maps pin, compensation, docs, instructions. | H-6 CTA | in: form → out: `POST /auditions` (→ payment) |
| H-8 | Manage Auditions | All posts with status (Active/Closed/Draft); edit/pause/delete. | Tab | in: `GET /auditions?me` → out: actions |
| H-9 | Edit Audition | Modify any field of a post. | H-8 | in: `GET /auditions/:id` → out: `PATCH /auditions/:id` |
| H-10 | Audition Applications | Applicants for one audition: name, category, location, date. | H-8 / H-6 | in: `GET /auditions/:id/applications` → out: detail |
| H-11 | Artist Application Detail | Full artist profile + portfolio + application; Shortlist/Reject/Schedule. | H-10 | in: `GET /applications/:id` → out: `PATCH /applications/:id/status` |
| H-12 | Shortlisted Candidates | Shortlisted artists for an audition; send interview notice. | H-10 / H-6 | in: `GET /auditions/:id/applications?status=shortlisted` → out: notify |
| H-13 | Schedule Interview / Slot | Set interview date/time/venue; notify shortlisted. | H-11 / H-12 | in: slot data → out: `POST /interviews` |
| H-14 | Artist Search | Search talent by category, location, age, gender, language, experience, physical features; advanced filters. | Tab | in: `GET /artists?filters` → out: profile view |
| H-15 | Artist Profile View (hiring) | Read-only artist profile + portfolio + contact-request option. | H-14 / H-10 | in: `GET /artists/:id` → out: nav to H-16 |
| H-16 | Send Communication Request | Direct contact/interview request with message. | H-15 | in: artistId, message → out: `POST /comm-requests` |
| H-17 | Notifications (Hiring) | New applications, system alerts, admin messages, chat. | Tab / bell | in: `GET /notifications` → out: mark read |
| H-18 | Payment & Subscription | Posting credits; pay ₹10/post; transaction history entry point. | H-7 / Tab | in: `POST /payments/order` → gateway session → out: confirm |
| H-19 | Transaction History | All payments: date, amount, description. | H-18 | in: `GET /payments?me` → out: — |
| H-20 | Hiring Settings | Password, notification prefs, logout. | Tab root | in: prefs → out: `PATCH /me/settings` |
| H-21 | Report Fraudulent Audition | Flag a suspicious audition with reason + details. | A-19-equivalent / H-4 | in: auditionId, reason → out: `POST /fraud-reports` |
| **H-22** | **Chat List** *(new, L2)* | Conversations with artists (post comm-request/shortlist). | Tab / H-11 | in: `GET /conversations?me` → out: open thread |
| **H-23** | **Chat Thread** *(new, L2)* | Real-time thread with one artist. | H-22 / H-11 | in: messages + Realtime → out: `POST /messages` |

*(H-1…H-23 = 23 screens; H-22/H-23 added by decision L2.)*

---

## 4. Admin Panel — Web (13 screens)

React + Vite SPA. Auth is email + password + 2FA (AD-1).

| # | Screen | Purpose | Entry point | Data in / out |
|---|---|---|---|---|
| AD-1 | Admin Login | Secure login: email + password + 2FA. | Web root | in: creds, 2FA → out: `POST /admin/login` |
| AD-2 | Admin Dashboard | Metrics: total artists, active auditions, pending verifications, revenue, fraud reports. | After login | in: `GET /admin/metrics` → out: nav |
| AD-3 | User Management | All users (artists + hiring): search, filter, activate/deactivate, view profile. | Nav | in: `GET /admin/users` → out: `PATCH /admin/users/:id` |
| AD-4 | Artist Management | View/edit/delete artist profiles; verification status; grant/revoke badge. | Nav | in: `GET /admin/artists` → out: badge/status patch |
| AD-5 | Company Verification Queue | Companies pending review; view docs; approve/reject with reason. | Nav / AD-2 | in: `GET /admin/verifications?pending` → out: `PATCH /admin/verifications/:id` |
| AD-6 | Verified Companies | Approved companies + badge status + profiles. | Nav | in: `GET /admin/companies?verified` → out: — |
| AD-7 | Blacklist Management | View/add/remove blacklisted users/companies with audit trail. | Nav | in: `GET /admin/blacklist` → out: `POST`/`DELETE /admin/blacklist` |
| AD-8 | Audition Moderation | Review active auditions; flag/pause/remove suspicious. | Nav | in: `GET /admin/auditions` → out: moderation patch |
| AD-9 | Fraud Reports | User-submitted reports; warn/suspend/blacklist. | Nav / AD-2 | in: `GET /admin/fraud-reports` → out: action patch |
| AD-10 | Payment Monitoring | All transactions; filter by date/amount/user type; export. | Nav | in: `GET /admin/payments` → out: export CSV |
| AD-11 | Analytics & Reports | Visual reports: artists, active auditions, application stats, top categories, engagement, revenue trends. | Nav | in: `GET /admin/analytics` → out: — |
| AD-12 | Content Management | Manage banners, FAQs, terms, privacy. | Nav | in: `GET /admin/content` → out: `PATCH /admin/content` |
| AD-13 | Admin Settings | Manage admin accounts, roles, permissions. | Nav | in: `GET /admin/admins` → out: role patch |

*(AD-1…AD-13 = 13 screens.)*

---

## 5. Fixed / seeded master data

- **Artist categories (16):** Actor, Singer, Model, Dancer, Voice Artist, Musician, Influencer, Anchor, Writer, Director, Editor, Cinematographer, Makeup Artist, Stylist, Technician, Background Artist.
- **Technician sub-categories (10):** Video Editor, Cinematographer, Makeup Artist, Fashion Stylist, Script Writer, Director, Assistant Director, Photographer, VFX Artist, Sound Engineer.
- **Hiring types (7):** Production House, Casting Agency, Individual Casting Director, Talent Manager, Event Organizer, Ad Agency, OTT Production Team.
- **Application statuses:** Pending, Shortlisted, Rejected, Interview Scheduled.
- **Audition statuses:** Draft, Pending Payment, Active, Closed, Removed.
- **Verification statuses:** Pending, Approved, Rejected.
- **Audition types:** Walk-in, Scheduled.
- **Post price:** ₹10 (seeded config, not hardcoded).
- **Languages, cities:** seeded reference lists (for filters).

---

## 6. Locked decisions (screen-level; see PRD §9 for full set)

- L1 Full BRD scope = MVP. L2 Chat screens (A-26/27, H-22/23) built now. L5 Chat unlocks only post comm-request/shortlist. L6 Hiring posting blocked until verified (H-3 gates H-6/H-7). L7 Audition sits in Draft/Pending Payment until webhook confirms (H-7 → H-18 → live).
- **L11 Two separate apps** — Artist app (AA-* auth + A-*) and Hiring app (HA-* auth + H-*); no role-selection screen.
- **L12 Email-OTP only** — auth screens n-2/n-3/n-6/n-7 use email, never phone/SMS.
- Splash + Onboarding explicitly kept per app (shell checklist above).
- Every data screen must implement loading/empty/error/offline per DESIGN.md §4 — not extra screens, but mandatory states.

---

## 7. Implied tables (drafts the schema — see SCHEMA.md)

`users`, `artists`, `artist_media`, `companies`, `company_documents`, `verifications`, `auditions`, `applications`, `interviews`, `comm_requests`, `conversations`, `messages`, `payments`, `notifications`, `fraud_reports`, `blacklist`, `admins`, `audit_logs`, `content`, plus reference tables `categories`, `technician_subcategories`, `hiring_types`, `languages`, `cities`.

---

## 8. Sign-Off

No design or build work starts until this Screen Map and the PRD are signed.

| Party | Name / Role | Signature | Date |
|---|---|---|---|
| Client | Harrsh Pandey | ________________ | ________ |
| CKR Technologies | ______________ — Delivery Lead | ________________ | ________ |
