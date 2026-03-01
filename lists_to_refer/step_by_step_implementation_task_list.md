# Step-by-Step Implementation Task List

This document merges security pre-launch requirements and subscription/billing implementation into one execution order.

## Scope
- Stack: Next.js App Router + TypeScript + Prisma + SQLite
- Target outcomes:
  - Minimum safe release standard
  - Subscription billing (first-month free trial, paid from month 2)
  - Per-user data ownership and premium gating

## Priority Labels
- `[BLOCKER]`: must be complete before launch
- `[HIGH]`: strongly recommended before launch
- `[POST]`: post-launch hardening

---

## Phase 1 - Secrets and Environment Hygiene

- [ ] 1.1 `[BLOCKER]` Verify `.env*` is excluded from git in `.gitignore`.
- [ ] 1.2 `[BLOCKER]` Confirm no secrets exist in tracked files or history snapshots.
- [ ] 1.3 `[BLOCKER]` Move all production secrets into hosting dashboard secret manager.
- [ ] 1.4 `[BLOCKER]` Ensure no secret values are referenced via `NEXT_PUBLIC_*`.
- [ ] 1.5 `[BLOCKER]` Add startup checks for required server env vars (`DATABASE_URL`, Stripe keys, webhook secret, price id).

Definition of done:
- Secrets are server-only and not committed.
- Missing required env vars fail fast on server startup.

---

## Phase 2 - Database Foundation for Users and Billing

- [ ] 2.1 `[BLOCKER]` Add `User` model to Prisma schema.
- [ ] 2.2 `[BLOCKER]` Add `userId` to workout data models (`WorkoutSession`, `WorkoutExercise`, `WorkoutSet`) with indexes.
- [ ] 2.3 `[BLOCKER]` Add billing models (`StripeCustomer`, `Subscription`, `StripeEvent`).
- [ ] 2.4 `[HIGH]` Add cloud sync snapshot model for authenticated sync safety.
- [ ] 2.5 `[BLOCKER]` Create and run Prisma migration.
- [ ] 2.6 `[BLOCKER]` Backfill existing workout rows with a known user if migration requires transitional nullable fields.

Definition of done:
- All workout rows are user-scoped.
- Billing and webhook idempotency tables exist.

---

## Phase 3 - Authentication Baseline

- [ ] 3.1 `[BLOCKER]` Implement password hashing/verification utility (server-side only).
- [ ] 3.2 `[BLOCKER]` Implement auth session storage with expiration.
- [ ] 3.3 `[BLOCKER]` Add auth APIs: register, login, logout, current user.
- [ ] 3.4 `[BLOCKER]` Set secure HTTP-only auth cookie in login flow.
- [ ] 3.5 `[BLOCKER]` Create `requireUserId`/`getUserIdFromRequest` helper for all protected handlers.
- [ ] 3.6 `[HIGH]` Add minimal Account page for sign-up/sign-in/out verification.

Definition of done:
- Protected handlers can resolve authenticated user id.
- Guest requests to protected endpoints are rejected with `401`.

---

## Phase 4 - API Input Validation and Error Safety

- [ ] 4.1 `[BLOCKER]` Install and apply Zod validation for all route handler inputs (body/query/params).
- [ ] 4.2 `[BLOCKER]` Add strict bounds:
  - strings max length (e.g., notes)
  - numeric min/max (`reps`, `rpe`, `restSeconds`)
  - array size limits (`sets`, `exercises`)
- [ ] 4.3 `[BLOCKER]` Standardize invalid input response to `400`.
- [ ] 4.4 `[BLOCKER]` Standardize internal error response to generic `500`.
- [ ] 4.5 `[BLOCKER]` Ensure stack traces and raw Prisma errors are never returned to clients.

Definition of done:
- Every API route validates and rejects malformed input safely.
- No sensitive error details leak in responses.

---

## Phase 5 - Ownership and Access Control

- [ ] 5.1 `[BLOCKER]` Scope all read queries by `userId`.
- [ ] 5.2 `[BLOCKER]` Enforce ownership checks on update/delete handlers (session, set, sync operations).
- [ ] 5.3 `[BLOCKER]` Return `403` for valid-but-unauthorized resource access.
- [ ] 5.4 `[HIGH]` Add ownership guard utilities to avoid duplicate logic.

Definition of done:
- One user cannot read/write another user’s workout data.

---

## Phase 6 - Stripe Subscription Core

- [ ] 6.1 `[BLOCKER]` Add Stripe SDK and server initializer.
- [ ] 6.2 `[BLOCKER]` Implement Checkout API for monthly subscription with 30-day trial.
- [ ] 6.3 `[HIGH]` Implement billing portal API for payment method and cancellation handling.
- [ ] 6.4 `[BLOCKER]` Implement webhook endpoint with signature verification.
- [ ] 6.5 `[BLOCKER]` Add webhook idempotency using stored event ids.
- [ ] 6.6 `[BLOCKER]` Sync subscription status fields from webhook events to DB.

Definition of done:
- Checkout -> webhook -> DB subscription state update works reliably.
- Duplicate webhook delivery does not duplicate side effects.

---

## Phase 7 - Entitlement and Product Gating

- [ ] 7.1 `[BLOCKER]` Implement `isPremium(userId)` based on subscription status and period validity.
- [ ] 7.2 `[BLOCKER]` Gate free users to recent history window (e.g., last 30 days) in log and contribution APIs.
- [ ] 7.3 `[HIGH]` Add UI upgrade prompts (`/pricing`) when user hits gated areas.
- [ ] 7.4 `[HIGH]` Add billing management page (`/account/billing`).
- [ ] 7.5 `[HIGH]` Apply premium checks to premium-only surfaces (plans/advanced features if required).

Definition of done:
- Free users are constrained by policy.
- Premium users have full access according to entitlement.

---

## Phase 8 - Rate Limiting and Abuse Protection

- [ ] 8.1 `[BLOCKER]` Add write-route rate limiting (`POST/PUT/PATCH/DELETE`).
- [ ] 8.2 `[BLOCKER]` Return `429` on quota exceed.
- [ ] 8.3 `[HIGH]` Add consistent retry guidance in `429` responses.
- [ ] 8.4 `[HIGH]` Add lightweight memory store now; design replaceable backend store for production scale.

Definition of done:
- Burst abuse is blocked and does not degrade service.

---

## Phase 9 - Security Headers and XSS Controls

- [ ] 9.1 `[BLOCKER]` Configure global headers in Next config:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` with denied-by-default sensitive features
- [ ] 9.2 `[BLOCKER]` Enable HSTS only after confirmed HTTPS in production.
- [ ] 9.3 `[BLOCKER]` Ensure user notes are rendered as plain text only.
- [ ] 9.4 `[BLOCKER]` Verify no use of `dangerouslySetInnerHTML` for user-provided data.

Definition of done:
- Baseline browser hardening headers are active.
- Notes field is not XSS-executable.

---

## Phase 10 - Cloud Sync Safety Layer

- [ ] 10.1 `[HIGH]` Require authenticated user for sync push/pull/apply APIs.
- [ ] 10.2 `[HIGH]` Store snapshots under `userId`.
- [ ] 10.3 `[HIGH]` Ensure apply operation cannot restore data across users.
- [ ] 10.4 `[HIGH]` Add basic validation for snapshot payload structure before apply.
- [ ] 10.5 `[HIGH]` Add sync status UI (`push`, `pull`, `apply`) with clear result metadata.

Definition of done:
- Sync operations are user-isolated and safe to execute repeatedly.

---

## Phase 11 - Analytics and Monitoring

- [ ] 11.1 `[HIGH]` Add structured logging for write operations and billing events.
- [ ] 11.2 `[HIGH]` Add metrics/alerts for spikes in `429` and `500`.
- [ ] 11.3 `[HIGH]` Integrate error monitoring service (Sentry or equivalent).
- [ ] 11.4 `[HIGH]` Add volume analytics endpoint sanity checks and auth scope.

Definition of done:
- Operational failures are detectable quickly with actionable signals.

---

## Phase 12 - Dependency and Supply Chain Security

- [ ] 12.1 `[HIGH]` Enable Dependabot for npm and GitHub Actions.
- [ ] 12.2 `[HIGH]` Add CI step: `npm audit --audit-level=high`.
- [ ] 12.3 `[BLOCKER]` Keep lockfile committed and updated.
- [ ] 12.4 `[POST]` Add SBOM generation in CI.

Definition of done:
- Dependency risk is continuously monitored in CI.

---

## Phase 13 - Backup and Recovery

- [ ] 13.1 `[HIGH]` Define daily backup strategy for production DB.
- [ ] 13.2 `[HIGH]` Implement automated backup job.
- [ ] 13.3 `[HIGH]` Run restore drill and record RTO/RPO.
- [ ] 13.4 `[POST]` Draft migration path from SQLite to managed Postgres.

Definition of done:
- Recovery process is tested, not just documented.

---

## Phase 14 - Pre-Launch Verification Runbook

- [ ] 14.1 `[BLOCKER]` Verify all API routes enforce validation.
- [ ] 14.2 `[BLOCKER]` Verify no secrets exposed in client bundle/responses.
- [ ] 14.3 `[BLOCKER]` Verify no stack traces or Prisma internals in API responses.
- [ ] 14.4 `[BLOCKER]` Verify write-route rate limiting returns `429`.
- [ ] 14.5 `[BLOCKER]` Verify security headers on representative pages and APIs.
- [ ] 14.6 `[BLOCKER]` Verify checkout/portal/webhook end-to-end in Stripe test mode.
- [ ] 14.7 `[BLOCKER]` Verify free vs premium access behavior for log/history gating.
- [ ] 14.8 `[BLOCKER]` Verify per-user ownership isolation with at least two test users.
- [ ] 14.9 `[HIGH]` Verify backup + restore once before launch.

Launch gate:
- Do not launch until all `[BLOCKER]` items are complete.

---

## Post-Launch Security Maturity Backlog

- [ ] P.1 `[POST]` Add DAST scan (e.g., OWASP ZAP) to staging pipeline.
- [ ] P.2 `[POST]` Schedule external penetration test.
- [ ] P.3 `[POST]` Replace temporary auth baseline with production-grade provider if needed.

