# API.md — FAMEU Backend Contract

> CKR Technologies · Express.js + Supabase · **Version:** v1.1 · **Date:** 19 Jul 2026
> The contract both the backend and frontend agents code against. Do not invent an endpoint, field, or response shape not listed here — if something is missing, stop and ask. Derived from `SCREEN-MAP.md` v1.1; tables in `SCHEMA.md` v1.1; permissions in `AUTH-MATRIX.md` v1.1.

## Conventions

- Base URL: `/api/v1`. All versioned; a v2 never breaks a shipped app.
- Auth: `Authorization: Bearer <Supabase JWT>` unless marked **public**.
- Standard response: `{ "success": true, "data": {...} }` or `{ "success": false, "error": { "code": "UPPER_SNAKE", "message": "human text" } }`.
- Lists: `{ success, data: { items: [...], nextCursor: string|null } }`. Cursor pagination (never offset for feeds).
- Timestamps ISO 8601 UTC. Money in paise as integers where charged (₹10 = `1000`), displayed as ₹ by the client.
- Idempotency: mutating payment/apply calls accept `Idempotency-Key` header; server dedupes.
- Roles: `artist`, `hiring`, `admin`. Enforced by RLS + route middleware, per AUTH-MATRIX.md.
- All document/media access (Aadhaar, PAN, company docs) is **admin-only**; never returned to artist/hiring responses.

---

## 1. Auth (public unless noted) — screens AA-2…AA-7 / HA-2…HA-7, AD-1

**Two apps, one auth backend.** The Artist app and Hiring app call the same endpoints; the caller's role is set by the **app identity** (a per-app client header `X-App: artist|hiring`), **not** a role field the user picks — there is no role-selection screen (PRD L11). Auth is **email-OTP only** — no phone/SMS channel (PRD L12).

```
POST /auth/otp/request      Header: X-App: artist|hiring
                            Body: { email, password? }        (channel is always email)
                            201: { requestId, resendInSec: 30 }
                            Errors: 429 OTP_RATE_LIMITED, 400 INVALID_EMAIL

POST /auth/otp/verify       Body: { requestId, otp }
                            200: { session: { accessToken, refreshToken }, user, isNewUser }
                            Errors: 400 OTP_INVALID, 410 OTP_EXPIRED

POST /auth/social           Header: X-App: artist|hiring
                            Body: { provider: "google"|"facebook", idToken }
                            200: { session, user, isNewUser }
                            Errors: 401 SOCIAL_AUTH_FAILED

POST /auth/login            Header: X-App: artist|hiring
                            Body: { email, password }
                            200: { session, user }
                            Errors: 401 INVALID_CREDENTIALS, 403 ACCOUNT_DISABLED, 403 BLACKLISTED,
                                    403 WRONG_APP  (an artist account signing into the hiring app, or vice-versa)

POST /auth/password/forgot  Body: { email }  → 200: { requestId }   (always 200 to avoid enumeration; reset OTP emailed)
POST /auth/password/reset   Body: { requestId, otp, newPassword } → 200: { ok: true }
POST /auth/refresh          Body: { refreshToken } → 200: { session }
POST /auth/logout           Auth → 204

POST /admin/login           Body: { email, password, otp2fa }  → 200: { session, admin }
                            Errors: 401 INVALID_CREDENTIALS, 401 INVALID_2FA
```

`user` shape: `{ id, role, email, phone?, status, createdAt }` — `role` is derived server-side from the app the account was created in; `phone` is optional profile/contact data only, never an auth factor. An account is bound to one app: signing into the wrong app returns `403 WRONG_APP`. Artists/companies fetched separately below.

---

## 2. Me / account — screens A-24, A-25, H-20

```
GET   /me                 → { user, profile }        (profile = artist or company for the role)
PATCH /me/settings        Body: { notificationPrefs?, privacy? } → { settings }
POST  /me/push-token      Body: { token, platform } → 204     (registered after first value moment)
DELETE /me                Body: { reason } → 202   (soft-delete + purge media per retention policy)
```

---

## 3. Artists — screens A-1…A-13, H-14, H-15, A-8

```
POST  /artists            Body: { category, subcategory?, fields: {...category-specific}, city, travelAvailability }
                          201: { artist }                 (media uploaded separately, then linked)
GET   /artists/:id        → { artist }  (public profile; contact info gated)  [public for share link]
PATCH /artists/:id        Body: partial fields → { artist }         (owner only)
GET   /artists            Query: category, city, ageMin, ageMax, gender, language, experienceMin,
                                 height/other physical filters, q, cursor
                          → { items: [artistCard], nextCursor }     (hiring + admin; talent search H-14)
GET   /artists/:id/photos → { items: [media] }
GET   /artists/:id/videos → { items: [media] }
```

`fields` is category-specific and validated per `categories.formSchema` (see SCHEMA.md): Actor {age,gender,height,weight,bodyType,skinTone,hairColor,eyeColor,languages[],actingExperience}; Singer {genre,vocalRange,languages[],instruments[],experience}; Model {height,weight,measurements,shoeSize,rampExperience,brandHistory}; Dancer {styles[],training,competitionHistory,certifications[]}; Technician {subcategory,experience,equipment,skills[]}. Unknown fields rejected.

### Media (portfolio, resume, audio, video) — A-10, A-11, A-12
```
POST   /media/upload-url  Body: { kind: "photo"|"video"|"audio"|"resume"|"intro"|"monologue"|"performance", contentType, sizeBytes }
                          201: { uploadUrl, mediaId }         (client PUTs to Supabase Storage signed URL)
POST   /media/:id/confirm Body: { } → { media }              (marks upload complete, links to owner)
DELETE /media/:id         → 204                               (owner only)
```

### Artist verification (optional) — A-13
```
POST /verification/artist Body: { idType: "aadhaar"|"pan"|"passport"|"dl", mediaId }
                          202: { status: "pending" }
GET  /verification/artist/status → { status: "none"|"pending"|"approved"|"rejected", reason? }
```

---

## 4. Companies (hiring) & verification — screens H-1…H-5, H-3

```
POST  /companies          Body: { type, name, contact:{phone,email}, socials?, description? }
                          201: { company }
GET   /companies/:id      → { company }   (public profile H-4/artist view; docs never included)  [public]
PATCH /companies/:id      Body: partial → { company }   (owner only)
GET   /companies/me/dashboard → { activeAuditions, totalApplications, shortlistedCount }   (H-6)

POST  /verification/company   Body: { documents:[{docType:"aadhaar"|"pan"|"company_reg"|"gst", mediaId}], selfieMediaId }
                              202: { status: "pending", estimatedHours: 48 }
GET   /verification/company/status → { status:"pending"|"approved"|"rejected", reason?, submittedAt }   (H-3)
```

Posting endpoints (§5) return `403 COMPANY_NOT_VERIFIED` until status = approved (enforces PRD L6).

---

## 5. Auditions — screens A-7, A-14…A-19, H-7…H-9, A-16, A-17, A-18

```
GET  /auditions           Query: city, category, language, companyId, roleType, type("walkin"|"scheduled"),
                                  q, dateFrom, dateTo, lat, lng, cursor
                          → { items: [auditionCard], nextCursor }                 (A-14/A-15/A-18)
GET  /auditions/feed      Query: lat, lng → { nearby:[], recommended:[], trending:[] }   (A-7 personalised, rule-based)
GET  /auditions/trending  → { items }                                              (A-16)
GET  /auditions/:id       → { audition }  [public for share]                        (A-19)

POST /auditions           Body: { title, roleDescription, characterRequirements, ageMin, ageMax, gender,
                                  category, language, type, dateTime, venue:{address,lat,lng},
                                  compensation, requiredDocuments[], instructions }
                          201: { audition: { id, status: "pending_payment" }, payment: { orderRequired: true } }
                          Errors: 403 COMPANY_NOT_VERIFIED
                          → audition stays pending_payment until webhook confirms (PRD L7)
PATCH /auditions/:id      Body: partial → { audition }        (owner; H-9)
POST  /auditions/:id/status  Body: { status:"active"|"closed"|"draft" } → { audition }   (owner; pause/close H-8)
DELETE /auditions/:id     → 204   (owner; soft-remove)
```

Saved auditions (for calendar A-17):
```
POST   /auditions/:id/save → 204
DELETE /auditions/:id/save → 204
GET    /me/saved-auditions → { items }
```

---

## 6. Applications — screens A-20, A-21, A-22, H-10, H-11, H-12

```
POST  /applications       Body: { auditionId, mediaIds[], coverNote? }   Header: Idempotency-Key
                          201: { application: { id, status:"pending" } }
                          Errors: 409 ALREADY_APPLIED, 410 AUDITION_CLOSED
GET   /applications       Query: me=true | auditionId | status | upcoming=true, cursor
                          → { items: [application], nextCursor }          (A-21 artist; H-10 hiring)
GET   /applications/:id   → { application, artist, audition }             (A-22 / H-11)
PATCH /applications/:id/status  Body: { status:"shortlisted"|"rejected"|"interview_scheduled" }
                          → { application }                                (hiring; H-11)
                          → side effect: shortlist/interview unlocks chat (PRD L5) + notification
```

---

## 7. Interviews — screen H-13

```
POST /interviews          Body: { applicationId, dateTime, venue:{address,lat,lng}, note? }
                          201: { interview }  → notifies artist
GET  /interviews          Query: me=true|auditionId → { items }
```

---

## 8. Communication requests & chat — screens H-16, A-26/27, H-22/23

```
POST /comm-requests       Body: { artistId, message }            (hiring → artist; H-16)
                          201: { commRequest: { id, status:"pending" } }
PATCH /comm-requests/:id  Body: { status:"accepted"|"declined" }  (artist decides)
                          → on accepted: creates conversation (PRD L5 gate)

GET  /conversations       Query: me=true → { items:[{ id, peer, lastMessage, unreadCount }] }   (A-26/H-22)
GET  /conversations/:id/messages  Query: cursor → { items:[message], nextCursor }               (A-27/H-23)
POST /messages            Body: { conversationId, text }  → 201: { message }
POST /conversations/:id/read → 204
```

Realtime: client subscribes to Supabase Realtime channel `conversation:<id>` (RLS-scoped to the two participants) for live message + read/typing events. Sending still goes through `POST /messages` so the server is the source of truth; Realtime only broadcasts.

---

## 9. Payments (Cashfree/Razorpay) — screens H-18, H-19

```
POST /payments/order      Body: { purpose:"audition_post", auditionId }   Header: Idempotency-Key
                          201: { orderId, gateway:"cashfree"|"razorpay", amount:1000, currency:"INR", paymentSession }
GET  /payments            Query: me=true, cursor → { items:[{ id, amount, purpose, status, createdAt }] }   (H-19)
GET  /payments/:id        → { payment }

POST /webhooks/payments   [public, signature-verified, NO app JWT]
                          Body: gateway payload
                          → verifies signature, marks payment paid/failed idempotently,
                            flips linked audition pending_payment → active on success.
                          200 always (after verification) so the gateway stops retrying.
```

The client never flips an audition to active. Only the webhook does (PRD L7). App polls `GET /payments/:id` or waits for a push after the webhook.

---

## 10. Notifications — screens A-23, H-17

```
GET  /notifications       Query: cursor → { items:[{ id, type, title, body, data, readAt, createdAt }] }
POST /notifications/:id/read → 204
POST /notifications/read-all → 204
```
Types: `audition_alert`, `application_status`, `interview`, `new_match`, `chat_message`, `comm_request`, `verification_result`, `admin_message`.

---

## 11. Fraud reports — screen H-21 (and artist-side report)

```
POST /fraud-reports       Body: { auditionId, reason, details? } → 201: { report }
```

---

## 12. Admin (role=admin, 2FA session) — screens AD-2…AD-13

```
GET   /admin/metrics                 → { totalArtists, activeAuditions, pendingVerifications, revenue, fraudReports }  (AD-2)
GET   /admin/users                   Query: role,status,q,cursor → { items, nextCursor }   (AD-3)
PATCH /admin/users/:id               Body: { status:"active"|"disabled" } → { user }
GET   /admin/artists                 Query: q,verified,cursor → { items }                  (AD-4)
PATCH /admin/artists/:id             Body: { verifiedBadge?:bool, status? } → { artist }

GET   /admin/verifications           Query: status=pending,cursor → { items:[{ company, documents[] }] }  (AD-5)
PATCH /admin/verifications/:id       Body: { decision:"approved"|"rejected", reason? } → { verification }
GET   /admin/companies               Query: verified=true → { items }                      (AD-6)

GET   /admin/blacklist               → { items }                                            (AD-7)
POST  /admin/blacklist               Body: { targetType:"user"|"company", targetId, reason } → { entry }
DELETE /admin/blacklist/:id          Body: { reason } → 204

GET   /admin/auditions               Query: status,flagged,cursor → { items }               (AD-8)
POST  /admin/auditions/:id/moderate  Body: { action:"flag"|"pause"|"remove", reason } → { audition }

GET   /admin/fraud-reports           Query: status,cursor → { items }                       (AD-9)
POST  /admin/fraud-reports/:id/action Body: { action:"warn"|"suspend"|"blacklist", reason } → { report }

GET   /admin/payments                Query: dateFrom,dateTo,userType,cursor → { items }      (AD-10)
GET   /admin/payments/export         Query: dateFrom,dateTo → CSV stream
GET   /admin/analytics               Query: range → { artists, activeAuditions, applicationStats,
                                                      topCategories, engagement, revenueTrend }  (AD-11)

GET   /admin/content                 → { banners, faqs, terms, privacy }                     (AD-12)
PATCH /admin/content                 Body: partial → { content }

GET   /admin/admins                  → { items }                                             (AD-13)
POST  /admin/admins                  Body: { email, role } → { admin }
PATCH /admin/admins/:id              Body: { role?, status? } → { admin }
```

Every admin write appends an `audit_logs` row (actor, action, target, reason, timestamp). Verification decisions and blacklist actions are immutable once written — corrections are new rows, never edits.

---

## 13. Error codes (canonical)

`OTP_RATE_LIMITED, OTP_INVALID, OTP_EXPIRED, INVALID_EMAIL, INVALID_CREDENTIALS, INVALID_2FA, WRONG_APP, ACCOUNT_DISABLED, BLACKLISTED, COMPANY_NOT_VERIFIED, ALREADY_APPLIED, AUDITION_CLOSED, PAYMENT_INIT_FAILED, PAYMENT_ALREADY_PROCESSED, WEBHOOK_SIGNATURE_INVALID, FORBIDDEN, NOT_FOUND, VALIDATION_FAILED, RATE_LIMITED, INTERNAL`.

All validation failures: `422 VALIDATION_FAILED` with `error.fields: { fieldName: message }`.

---

## 14. Open contract questions (mirror PRD §10)
- Gateway primary (Cashfree vs Razorpay) — response includes `gateway`, but pick one before payments build.
- Aadhaar storage minimisation — if verified-and-discard is chosen, `documents[]` in the admin verification response returns a short-lived signed URL only during review, then null.
- Walk-in auditions free vs ₹10 — if free, `POST /auditions` for `type:"walkin"` returns `status:"active"` directly with no payment step.
