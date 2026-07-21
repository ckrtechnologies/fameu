# JOBS.md — FAMEU Background Tasks

> CKR Technologies · **Version:** v1.1 · **Date:** 19 Jul 2026
> Background work is invisible in the Screen Map, so it lives here: schedule, purpose, idempotency. Run as scheduled Supabase Edge Functions / pg_cron, or PM2 cron on the VPS (decide in DEPLOYMENT.md). Every job must be idempotent — a double-run must not double-effect.

| Job | Schedule | Purpose | Idempotency |
|---|---|---|---|
| **expire-auditions** | hourly | Move `active` auditions past their `date_time` to `closed`. | Filter by status+date; re-run is a no-op once closed. |
| **payment-reconcile** | every 15 min | For `payments.status=created` older than N minutes with no webhook, query the gateway for true status and reconcile (mostly catches missed webhooks). | Keyed on `gateway_order_id`; only transitions `created`→terminal, never re-flips. |
| **cleanup-orphan-media** | daily | Delete Storage objects whose `media.status=pending` never confirmed after 24h. | Deletes only unconfirmed, unlinked media. |
| **retention-purge** | daily | Enforce data-minimisation: purge `private-docs` media per the chosen Aadhaar retention policy (PRD §10.5) and hard-delete soft-deleted accounts past the grace window. | Operates on rows past the retention threshold; re-run finds none. |
| **verification-sla-nudge** | every 6h | Flag company verifications pending > 48h on the admin dashboard (surfacing, not auto-deciding). | Recomputes a flag; idempotent. |
| **notification-digest** *(optional, Phase-2 candidate)* | daily | Batch "new auditions matching your profile" for artists who opted in. | Dedupe on (user, date). |
| **db-backup-verify** | daily | Confirm the nightly Supabase backup succeeded and is restorable (alert on failure). | Read-only check. |

Rules:
- No job edits an audit-sensitive row in place (verifications/payments/blacklist) — it only appends status or acts on non-audit content.
- `expire-auditions` and `payment-reconcile` are the two that touch money/go-live state; both are strictly forward-only transitions.
- Every job logs start/end + affected count to Sentry/logs; a job that errors alerts, it doesn't fail silently.
