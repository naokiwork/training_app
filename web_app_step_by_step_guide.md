# Calisthenics Web App Development Task Checklist

This is a numbered, short-task checklist you can execute directly.

## Work Status (Paused)

- Pause point: after `5.1` (next start task is `5.2`).
- Last completed block: setup, DB foundation, seed, global layout.
- In-progress area before pause: route skeleton expansion and shared UI components.
- Note: `components/StatusBadge.tsx` is created; `MetadataRow` creation was started but not completed.

## 0. Scope and Rules

- [x] 0.1 Confirm MVP scope: `Log + Exercise Guide + Plans`.
- [x] 0.2 Confirm stack: `Next.js + TypeScript + Tailwind + Prisma + SQLite`.
- [x] 0.3 Confirm UX rules: clear CTA, consistent nav, searchable lists, relative time, status colors.

## 1. Project Setup

- [x] 1.1 Create Next.js app (App Router + TypeScript).
- [x] 1.2 Install Tailwind and verify styles load.
- [x] 1.3 Install Prisma + Prisma Client.
- [x] 1.4 Set `DATABASE_URL` in `.env`.
- [x] 1.5 Run app locally and verify blank home page renders.

## 2. Database Foundation

- [x] 2.1 Define `Exercise` model in `prisma/schema.prisma`.
- [x] 2.2 Define `WorkoutSession` model.
- [x] 2.3 Define `WorkoutExercise` model with session relation.
- [x] 2.4 Define `WorkoutSet` model with workout-exercise relation.
- [x] 2.5 Run `prisma migrate dev` and confirm tables are created.
- [x] 2.6 Add Prisma client singleton (`lib/prisma.ts`).

## 3. Seed Core Exercise Data

- [x] 3.1 Create `prisma/seed.ts`.
- [x] 3.2 Insert 10-30 core exercises (push/pull/legs/core).
- [x] 3.3 Add fields for basic guide content (purpose/cues/mistakes/safety).
- [x] 3.4 Run seed and verify rows exist.

## 4. Global Layout and Navigation

- [x] 4.1 Implement shared header in `app/layout.tsx`.
- [x] 4.2 Add nav links: `Dashboard`, `Log`, `Exercises`, `Plans`.
- [x] 4.3 Add primary CTA button (`New Log`) in header.
- [x] 4.4 Add consistent page container spacing and max width.

## 5. Route Skeletons

- [x] 5.1 Create `app/page.tsx` (dashboard skeleton).
- [ ] 5.2 Create `app/log/page.tsx` (log list skeleton).
- [ ] 5.3 Create `app/log/new/page.tsx` (new log skeleton).
- [ ] 5.4 Create `app/exercises/page.tsx` (exercise list skeleton).
- [ ] 5.5 Create `app/exercises/[id]/page.tsx` (exercise detail skeleton).
- [ ] 5.6 Create `app/plans/page.tsx` (plan list skeleton).
- [ ] 5.7 Create `app/plans/[id]/page.tsx` (plan detail skeleton).

## 6. Logging API

- [ ] 6.1 Create `app/api/logs/route.ts` with `POST`.
- [ ] 6.2 Validate required fields (`date`, at least one set).
- [ ] 6.3 Persist session + exercises + sets in one transaction path.
- [ ] 6.4 Return saved session ID/date response.
- [ ] 6.5 Add clear error messages for invalid payload.

## 7. New Log UI (Fast Input)

- [ ] 7.1 Build exercise picker UI in `app/log/new/*`.
- [ ] 7.2 Add "add exercise block" action.
- [ ] 7.3 Add "add set" action per exercise.
- [ ] 7.4 Add quick reps control (`-1 / +1`).
- [ ] 7.5 Add default rest seconds for new sets.
- [ ] 7.6 Add "copy previous set values" behavior.
- [ ] 7.7 Add save button to call `POST /api/logs`.
- [ ] 7.8 Redirect to log page after successful save.

## 8. Log List and Detail

- [ ] 8.1 Query sessions by date.
- [ ] 8.2 Render session cards in `app/log/page.tsx`.
- [ ] 8.3 Render nested exercise and set tables.
- [ ] 8.4 Show daily summary (sessions/sets/reps totals).
- [ ] 8.5 Add empty state for no logs.
- [ ] 8.6 Add relative time text where useful.

## 9. Exercise Guide Pages

- [ ] 9.1 Query and render exercise list.
- [ ] 9.2 Add search input for exercise names/categories.
- [ ] 9.3 Add category filter chips/dropdown.
- [ ] 9.4 Render exercise detail content blocks:
- [ ] 9.4.1 Purpose
- [ ] 9.4.2 Form cues
- [ ] 9.4.3 Common mistakes
- [ ] 9.4.4 Safety notes
- [ ] 9.4.5 Regression/progression

## 10. Plan Pages (Preset-Driven MVP)

- [x] 10.1 Create `data/plans.ts` with 3 presets.
- [ ] 10.2 Render plan cards in `app/plans/page.tsx`.
- [ ] 10.3 Render weekly split in `app/plans/[id]/page.tsx`.
- [ ] 10.4 Add progression rules section (8-week style).
- [ ] 10.5 Link plan exercises to guide pages.

## 11. GitHub-Inspired UI Refinement

- [ ] 11.1 Add consistent metadata row component.
- [x] 11.2 Add status badge styles (success/warning/error/info).
- [ ] 11.3 Add reusable tabs for page-level sub-navigation.
- [ ] 11.4 Add sidebar info blocks on detail pages.
- [ ] 11.5 Verify hierarchy: title > status > metadata > details.

## 12. Dashboard Heatmap

- [ ] 12.1 Create `app/api/contributions/route.ts`.
- [ ] 12.2 Aggregate daily training load (minimum: total sets/day).
- [ ] 12.3 Build `components/Heatmap.tsx`.
- [ ] 12.4 Render one cell per day on dashboard.
- [ ] 12.5 Add click-to-filter behavior to open that day in logs.
- [ ] 12.6 Add no-data state for empty history.

## 13. Safety and Validation

- [ ] 13.1 Add numeric range validation (`reps`, `rest`, `rpe`).
- [ ] 13.2 Add optional pain flag field in log form.
- [ ] 13.3 Add optional form quality flag per set.
- [ ] 13.4 Surface validation errors inline in UI.
- [ ] 13.5 Prevent save when required structure is missing.

## 14. Quality Pass

- [ ] 14.1 Add loading states for all data-fetching pages.
- [ ] 14.2 Add empty states for all list pages.
- [ ] 14.3 Add basic error states for API failures.
- [ ] 14.4 Run type-check and fix issues.
- [ ] 14.5 Run lints and fix issues.
- [ ] 14.6 Quick responsive check (mobile/tablet/desktop).

## 15. Release Readiness (MVP)

- [ ] 15.1 Test flow: create log -> verify in list/detail.
- [ ] 15.2 Test flow: open exercise list -> open detail.
- [ ] 15.3 Test flow: open plans -> open one plan.
- [ ] 15.4 Test flow: dashboard heatmap click -> filtered logs.
- [ ] 15.5 Confirm shared `Exercise` data is used across Log/Guide/Plan.
- [ ] 15.6 Tag MVP complete in `README.md`.

## 16. Post-MVP Tasks

- [ ] 16.1 Add edit existing log session.
- [ ] 16.2 Add delete session and delete set actions.
- [ ] 16.3 Add rest timer workflow in new log UI.
- [ ] 16.4 Add auto progression suggestion from history.
- [ ] 16.5 Add volume analytics by muscle group.
- [ ] 16.6 Add auth and cloud sync.
