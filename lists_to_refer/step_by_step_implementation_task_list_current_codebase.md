# Step-by-Step Task List (Mapped to Current Codebase)

> [!WARNING]
> Legacy spec. Current implementation policy is no API and no environment variables.
> Follow `lists_to_refer/no_api_no_env_full_migration_task_document.md` first.

This is the file-level execution checklist for the current repository state.

Base reference:
- `lists_to_refer/step_by_step_implementation_task_list.md`

---

## 0. Core Files Map

- Schema: `prisma/schema.prisma`
- Auth core: `lib/auth.ts`
- DB client: `lib/prisma.ts`
- Global shell/UI: `app/layout.tsx`, `app/page.tsx`
- Auth APIs: `app/api/auth/*/route.ts`
- Billing/sync/progression/analytics APIs:
  - `app/api/sync/*/route.ts`
  - `app/api/progression/route.ts`
  - `app/api/analytics/volume/route.ts`
- Workout APIs:
  - `app/api/logs/route.ts`
  - `app/api/logs/[id]/route.ts`
  - `app/api/contributions/route.ts`
  - `app/api/exercises/route.ts`
- Feature pages:
  - `app/log/*`
  - `app/exercises/*`
  - `app/plans/*`
  - `app/auth/page.tsx`
  - `app/sync/page.tsx`
- Reusable UI:
  - `components/AuthStatus.tsx`
  - `components/VolumeAnalytics.tsx`
  - `components/Heatmap.tsx`
  - `components/MetadataRow.tsx`
  - `components/PageTabs.tsx`
  - `components/SidebarInfo.tsx`
  - `components/StatusBadge.tsx`

---

## 1. Secrets and Environment Hygiene

- [x] 1.1 Add/verify secret-only variables in `.env` (`DATABASE_URL`, Stripe keys, webhook secret, price id).
- [x] 1.2 Verify `.gitignore` excludes `.env*`.
- [x] 1.3 Add server startup env checks in:
  - `lib/auth.ts`
  - Stripe initializer file (if added later as `lib/stripe.ts`)
- [x] 1.4 Ensure no `NEXT_PUBLIC_*` contains secret values.

---

## 2. Schema and Migration Hardening

- [x] 2.1 Review `prisma/schema.prisma` and confirm:
  - user ownership relations for workout data
  - auth session model
  - cloud sync snapshot model
- [x] 2.2 Add/adjust indexes for high-traffic lookups:
  - user/date on sessions
  - token/expiry on auth sessions
- [x] 2.3 Run migration and client generation:
  - `npx prisma migrate dev -n <name>`
  - `npx prisma generate`

---

## 3. Auth and Session Enforcement

- [x] 3.1 Validate password/session logic in `lib/auth.ts`:
  - hash/verify correctness
  - session expiry cleanup
- [x] 3.2 Enforce authenticated user on protected APIs:
  - `app/api/logs/route.ts`
  - `app/api/logs/[id]/route.ts`
  - `app/api/contributions/route.ts`
  - `app/api/progression/route.ts`
  - `app/api/analytics/volume/route.ts`
  - `app/api/sync/*/route.ts`
- [x] 3.3 Validate account UX in:
  - `app/auth/page.tsx`
  - `components/AuthStatus.tsx`
  - `app/layout.tsx`

---

## 4. API Validation and Error Uniformity

- [x] 4.1 Introduce Zod for all request inputs (currently mixed manual validation).
- [x] 4.2 Apply validation to:
  - `app/api/logs/route.ts`
  - `app/api/logs/[id]/route.ts`
  - `app/api/auth/register/route.ts`
  - `app/api/auth/login/route.ts`
  - `app/api/progression/route.ts`
  - `app/api/analytics/volume/route.ts`
  - `app/api/sync/apply/route.ts`
- [x] 4.3 Standardize responses:
  - validation error: `400`
  - auth error: `401`
  - ownership error: `403`
  - server error: generic `500` (no internal detail)

---

## 5. Ownership and Data Isolation

- [x] 5.1 Verify all workout reads include user scope:
  - `app/log/page.tsx`
  - `app/log/[id]/edit/page.tsx`
  - all relevant API handlers
- [x] 5.2 Verify update/delete enforce owner:
  - `app/api/logs/[id]/route.ts`
  - `app/api/sync/apply/route.ts`
- [x] 5.3 Add dedicated guard util file (optional but recommended):
  - `lib/guards.ts`

---

## 6. Subscription/Billing Integration (Stripe)

Note: not yet present in codebase.

- [x] 6.1 Add `lib/stripe.ts` initializer.
- [x] 6.2 Add checkout API:
  - `app/api/billing/checkout/route.ts`
- [x] 6.3 Add customer portal API:
  - `app/api/billing/portal/route.ts`
- [x] 6.4 Add webhook API with signature verification + idempotency:
  - `app/api/billing/webhook/route.ts`
- [x] 6.5 Add pricing/billing pages:
  - `app/pricing/page.tsx`
  - `app/account/billing/page.tsx`

---

## 7. Entitlement and Feature Gating

- [x] 7.1 Add entitlement util (if not already separated):
  - `lib/entitlements.ts`
- [x] 7.2 Wire free/premium access policy into:
  - `app/api/logs/route.ts`
  - `app/api/contributions/route.ts`
- [x] 7.3 Add upgrade prompts in:
  - `app/log/page.tsx`
  - `app/page.tsx`
  - premium pages (`app/plans/page.tsx` if gated)

---

## 8. Security Headers and XSS Controls

- [x] 8.1 Add security headers in `next.config.ts`:
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - HSTS (only when HTTPS is guaranteed)
- [x] 8.2 Verify notes are always rendered as plain text in:
  - `app/log/page.tsx`
  - `app/log/[id]/edit/*`
- [x] 8.3 Confirm no `dangerouslySetInnerHTML` usage across app.

---

## 9. Rate Limiting for Write APIs

- [x] 9.1 Add rate-limit utility:
  - `lib/rate-limit.ts`
- [x] 9.2 Apply to write handlers:
  - `app/api/logs/route.ts`
  - `app/api/logs/[id]/route.ts`
  - `app/api/auth/register/route.ts`
  - `app/api/auth/login/route.ts`
  - `app/api/sync/push/route.ts`
  - `app/api/sync/apply/route.ts`
- [x] 9.3 Return `429` with consistent JSON shape.

---

## 10. Cloud Sync Safety Completion

- [x] 10.1 Tighten payload schema checks in:
  - `app/api/sync/apply/route.ts`
- [x] 10.2 Add snapshot versioning and checksum fields (schema + API).
- [x] 10.3 Add explicit conflict/overwrite warning flow in:
  - `app/sync/page.tsx`

---

## 11. Observability and Dependency Security

- [x] 11.1 Add structured request logging wrapper for APIs.
- [x] 11.2 Integrate Sentry (or equivalent):
  - `app/error.tsx`
  - route handlers
- [x] 11.3 Add CI checks:
  - `npm run lint`
  - `npm run build`
  - `npm audit --audit-level=high`
- [x] 11.4 Enable Dependabot config in repository.

---

## 12. Verification Runbook (Current Repo)

- [ ] 12.1 Account flow:
  - register -> login -> logout (`/auth`)
- [ ] 12.2 Log flow:
  - create (`/log/new`) -> list (`/log`) -> edit (`/log/[id]/edit`) -> delete
- [ ] 12.3 Analytics flow:
  - heatmap (`components/Heatmap.tsx`)
  - volume chart (`components/VolumeAnalytics.tsx`)
- [ ] 12.4 Sync flow:
  - push -> pull -> apply (`/sync`)
- [ ] 12.5 Security checks:
  - invalid input rejected
  - unauthorized requests blocked
  - no sensitive error leakage
  - headers present
  - rate limiting active

Launch condition:
- All security/billing `[BLOCKER]` items in the parent task list must be complete.

