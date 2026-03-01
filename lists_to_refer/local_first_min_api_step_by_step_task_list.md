# Local-First + Min-API Implementation Task List

This checklist converts `LOCAL_FIRST_MIN_API_PLAN.md` into execution-ready implementation tasks.

Scope:
- Keep server APIs only for billing (`checkout`, `portal`, `webhook`)
- Move workout logging and heatmap data flow to local storage (IndexedDB)
- Remove dependency on workout/log/contribution analytics APIs for core user flow

---

## Phase 0 — Decisions and Preconditions

- [x] 0.1 **Lock session policy** (default: multiple sessions per day allowed, `id` primary key).
  - Files: `lists_to_refer/LOCAL_FIRST_MIN_API_PLAN.md` (reference only)
  - Done when: policy is explicitly accepted before implementation.

- [x] 0.2 **Confirm local-first tradeoffs are accepted** (no cross-device sync in Phase 1).
  - Files: `README.md` (later documentation update), this checklist
  - Done when: team agrees that data can be device-local only for this phase.

- [x] 0.3 **Install local DB dependency**.
  - Files: `package.json`, `package-lock.json`
  - Action: `npm i idb`
  - Done when: `idb` is listed in dependencies.

---

## Phase 1 — Billing Baseline (Server Minimum)

- [x] 1.1 **Validate required billing env vars**.
  - Files: `.env`, `lib/env.ts`
  - Required: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY_100JPY`, `NEXT_PUBLIC_APP_URL`
  - Done when: missing variables fail fast in billing paths.

- [x] 1.2 **Keep only billing-related persistent models in Prisma**.
  - Files: `prisma/schema.prisma`
  - Models required: `User`, `StripeCustomer`, `Subscription`, `StripeEvent`
  - Done when: schema represents billing truth and can be migrated.

- [x] 1.3 **Run schema sync**.
  - Files: `prisma/migrations/*`
  - Actions:
    - `npx prisma migrate dev -n local_first_billing_baseline`
    - `npx prisma generate`
  - Done when: migration and Prisma client generation succeed.

- [x] 1.4 **Harden Stripe initializer**.
  - Files: `lib/stripe.ts`
  - Done when: Stripe client initialization is safe and env-guarded.

---

## Phase 2 — Billing API Routes (Required Server APIs)

- [x] 2.1 **Checkout route supports customer reuse and subscription checkout**.
  - Files: `app/api/billing/checkout/route.ts`, `lib/auth.ts`, `lib/prisma.ts`
  - Done when: route returns checkout URL and links metadata to `userId`.

- [x] 2.2 **Portal route opens Stripe customer portal**.
  - Files: `app/api/billing/portal/route.ts`
  - Done when: route returns portal URL for existing Stripe customer.

- [x] 2.3 **Webhook route verifies signature**.
  - Files: `app/api/billing/webhook/route.ts`
  - Done when: invalid signature returns `400`, valid events are accepted.

- [x] 2.4 **Webhook idempotency with event log**.
  - Files: `app/api/billing/webhook/route.ts`, `prisma/schema.prisma`
  - Done when: repeated event IDs are ignored safely.

- [x] 2.5 **Subscription upsert from Stripe events**.
  - Files: `app/api/billing/webhook/route.ts`
  - Done when: `customer.subscription.created|updated|deleted` updates local subscription state.

---

## Phase 3 — Local DB Foundation (IndexedDB)

- [x] 3.1 **Create IndexedDB schema layer**.
  - Files: `lib/localdb/db.ts` (new)
  - Stores:
    - `sessions`
    - `sessionExercises`
    - `sets`
    - `exercises`
    - `meta`
  - Indexes:
    - `sessions.date`
    - `sessionExercises.sessionId`
    - `sets.sessionExerciseId`
  - Done when: DB opens successfully and schema version is stable.

- [x] 3.2 **Create local repository CRUD**.
  - Files: `lib/localdb/repo.ts` (new)
  - Required operations:
    - list sessions by date/range
    - upsert session with nested exercises/sets
    - delete session with children
    - optional local exercise cache operations
  - Done when: full log CRUD works without server log APIs.

- [x] 3.3 **Apply update strategy (`updatedAt`, session-level replace)**.
  - Files: `lib/localdb/repo.ts`
  - Done when: updates are deterministic and do not produce orphan records.

---

## Phase 4 — Log Page Migration to Local-First

- [x] 4.1 **Replace `/log` data source from API to local repo**.
  - Files: `app/log/page.tsx`
  - Replace: server/API fetch logic with local repository reads.
  - Done when: log list loads correctly with local data only.

- [x] 4.2 **Keep edit/delete behavior via local repo**.
  - Files: `app/log/page.tsx`, `app/log/SessionActions.tsx`
  - Done when: delete reflects immediately in local list and state.

- [x] 4.3 **Ensure notes and flags are handled locally**.
  - Files: `app/log/page.tsx`, related log components
  - Done when: no regression in note display, pain/form flags, and session summary.

---

## Phase 5 — New Log Flow Migration

- [x] 5.1 **Replace `/log/new` submit path with local upsert**.
  - Files: `app/log/new/NewLogForm.tsx`, `app/log/new/page.tsx`
  - Done when: creating a session no longer depends on `/api/logs`.

- [x] 5.2 **Keep exercise selection behavior compatible**.
  - Files: `app/log/new/NewLogForm.tsx`, `app/api/exercises/route.ts` (optional keep as read API)
  - Done when: exercise search/selection still works.

- [x] 5.3 **Validate saved session appears in `/log`**.
  - Files: `app/log/new/*`, `app/log/page.tsx`
  - Done when: newly saved local session is visible after navigation/reload.

---

## Phase 6 — Heatmap Local Aggregation

- [x] 6.1 **Create local heatmap aggregator**.
  - Files: `lib/localdb/heatmap.ts` (new)
  - Output shape: `{ date, count }[]`
  - Done when: aggregation is computed from local sessions by date.

- [x] 6.2 **Detach heatmap from `/api/contributions`**.
  - Files: `components/Heatmap.tsx`
  - Done when: heatmap renders only from local aggregation.

- [x] 6.3 **Remove contribution API dependency from dashboard flow**.
  - Files: `app/page.tsx`, `components/Heatmap.tsx`
  - Done when: dashboard works without calling `/api/contributions`.

---

## Phase 7 — Premium Gating (Local-First Reality)

- [x] 7.1 **Keep premium truth from billing state**.
  - Files: `lib/entitlements.ts`
  - Done when: premium is derived from subscription status (`trialing|active` + period checks).

- [x] 7.2 **Apply UI-level free/premium limits**.
  - Files: `app/page.tsx`, `app/log/page.tsx`, optionally analytics components
  - Suggested policy:
    - Free: last 30 days only
    - Premium: full history
  - Done when: UI behavior switches by entitlement.

- [x] 7.3 **Document limitation of local-only gating**.
  - Files: `README.md`
  - Done when: docs explicitly state that strict anti-tamper is out of scope in this phase.

---

## Phase 8 — API Cleanup / De-Scope

- [x] 8.1 **Deprecate workout log APIs from active flow**.
  - Files:
    - `app/api/logs/route.ts`
    - `app/api/logs/[id]/route.ts`
  - Done when: app core flow no longer depends on these routes.

- [x] 8.2 **Deprecate analytics/sync APIs from active flow**.
  - Files:
    - `app/api/contributions/route.ts`
    - `app/api/analytics/volume/route.ts`
    - `app/api/progression/route.ts`
    - `app/api/sync/*/route.ts`
  - Done when: local-first path works without these endpoints.

- [x] 8.3 **Keep `exercises` API only if still required**.
  - Files: `app/api/exercises/route.ts`
  - Decision:
    - Keep as read API (simpler now), or
    - Move to local exercise cache fully
  - Done when: decision is implemented and documented.

---

## Phase 9 — Verification Runbook

- [x] 9.1 **Static checks**
  - Commands:
    - `npm run lint`
    - `npm run build`
  - Done when: both pass.

- [ ] 9.2 **Billing API checks**
  - Verify:
    - `POST /api/billing/checkout` returns URL
    - `POST /api/billing/portal` returns URL for customer
    - `POST /api/billing/webhook` handles valid signature and idempotency
  - Note: if Stripe env values are placeholders/empty, this check remains pending.
  - Done when: subscription state updates in DB through webhook events.

- [x] 9.3 **Local log checks**
  - Verify:
    - create session in `/log/new`
    - list in `/log`
    - edit/delete in `/log`
  - Done when: operations persist across browser refresh in same device.

- [x] 9.4 **Heatmap checks**
  - Verify:
    - heatmap displays from local aggregation
    - no request to `/api/contributions` is required for rendering
  - Done when: network panel confirms local-only computation path.

- [x] 9.5 **Premium checks**
  - Verify:
    - free user is limited to recent window
    - premium user sees full range
  - Done when: entitlement changes are reflected in UI behavior.

---

## Deferred to Phase 2 (Do Not Implement Now)

- [ ] D2.1 Cross-device sync API (`push/pull/apply`)
- [ ] D2.2 Full production authentication replacement for dev user shortcut
- [ ] D2.3 Server-side strict access control for local workout payloads

---

## Recommended Execution Order (Shortest Path)

1. Phase 1 (billing baseline)
2. Phase 2 (billing APIs)
3. Phase 3 (IndexedDB foundation)
4. Phase 4 + 5 (log/new-log migration)
5. Phase 6 (heatmap local aggregation)
6. Phase 7 (premium UI limits)
7. Phase 8 (cleanup/de-scope)
8. Phase 9 (verification)
