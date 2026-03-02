# Calisthenics Web App Development Task Checklist

> [!WARNING]
> Legacy spec. Current implementation policy is no API and no environment variables.
> Follow `lists_to_refer/no_api_no_env_full_migration_task_document.md` first.

This is a numbered, short-task checklist you can execute directly.

## Work Status (Updated)

- Current point: all tasks complete.
- Last completed block: volume analytics by muscle group and auth + cloud sync foundation.
- Build status: `npm run build` and `npm run lint` passed after latest changes.

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
- [x] 5.2 Create `app/log/page.tsx` (log list skeleton).
- [x] 5.3 Create `app/log/new/page.tsx` (new log skeleton).
- [x] 5.4 Create `app/exercises/page.tsx` (exercise list skeleton).
- [x] 5.5 Create `app/exercises/[id]/page.tsx` (exercise detail skeleton).
- [x] 5.6 Create `app/plans/page.tsx` (plan list skeleton).
- [x] 5.7 Create `app/plans/[id]/page.tsx` (plan detail skeleton).

## 6. Logging API

- [x] 6.1 Create `app/api/logs/route.ts` with `POST`.
- [x] 6.2 Validate required fields (`date`, at least one set).
- [x] 6.3 Persist session + exercises + sets in one transaction path.
- [x] 6.4 Return saved session ID/date response.
- [x] 6.5 Add clear error messages for invalid payload.

## 7. New Log UI (Fast Input)

- [x] 7.1 Build exercise picker UI in `app/log/new/*`.
- [x] 7.2 Add "add exercise block" action.
- [x] 7.3 Add "add set" action per exercise.
- [x] 7.4 Add quick reps control (`-1 / +1`).
- [x] 7.5 Add default rest seconds for new sets.
- [x] 7.6 Add "copy previous set values" behavior.
- [x] 7.7 Add save button to call `POST /api/logs`.
- [x] 7.8 Redirect to log page after successful save.

## 8. Log List and Detail

- [x] 8.1 Query sessions by date.
- [x] 8.2 Render session cards in `app/log/page.tsx`.
- [x] 8.3 Render nested exercise and set tables.
- [x] 8.4 Show daily summary (sessions/sets/reps totals).
- [x] 8.5 Add empty state for no logs.
- [x] 8.6 Add relative time text where useful.

## 9. Exercise Guide Pages

- [x] 9.1 Query and render exercise list.
- [x] 9.2 Add search input for exercise names/categories.
- [x] 9.3 Add category filter chips/dropdown.
- [x] 9.4 Render exercise detail content blocks:
- [x] 9.4.1 Purpose
- [x] 9.4.2 Form cues
- [x] 9.4.3 Common mistakes
- [x] 9.4.4 Safety notes
- [x] 9.4.5 Regression/progression

## 10. Plan Pages (Preset-Driven MVP)

- [x] 10.1 Create `data/plans.ts` with 3 presets.
- [x] 10.2 Render plan cards in `app/plans/page.tsx`.
- [x] 10.3 Render weekly split in `app/plans/[id]/page.tsx`.
- [x] 10.4 Add progression rules section (8-week style).
- [x] 10.5 Link plan exercises to guide pages.

## 11. GitHub-Inspired UI Refinement

- [x] 11.1 Add consistent metadata row component.
- [x] 11.2 Add status badge styles (success/warning/error/info).
- [x] 11.3 Add reusable tabs for page-level sub-navigation.
- [x] 11.4 Add sidebar info blocks on detail pages.
- [x] 11.5 Verify hierarchy: title > status > metadata > details.

## 12. Dashboard Heatmap

- [x] 12.1 Create `app/api/contributions/route.ts`.
- [x] 12.2 Aggregate daily training load (minimum: total sets/day).
- [x] 12.3 Build `components/Heatmap.tsx`.
- [x] 12.4 Render one cell per day on dashboard.
- [x] 12.5 Add click-to-filter behavior to open that day in logs.
- [x] 12.6 Add no-data state for empty history.

## 13. Safety and Validation

- [x] 13.1 Add numeric range validation (`reps`, `rest`, `rpe`).
- [x] 13.2 Add optional pain flag field in log form.
- [x] 13.3 Add optional form quality flag per set.
- [x] 13.4 Surface validation errors inline in UI.
- [x] 13.5 Prevent save when required structure is missing.

## 14. Quality Pass

- [x] 14.1 Add loading states for all data-fetching pages.
- [x] 14.2 Add empty states for all list pages.
- [x] 14.3 Add basic error states for API failures.
- [x] 14.4 Run type-check and fix issues.
- [x] 14.5 Run lints and fix issues.
- [x] 14.6 Quick responsive check (mobile/tablet/desktop).

## 15. Release Readiness (MVP)

- [x] 15.1 Test flow: create log -> verify in list/detail.
- [x] 15.2 Test flow: open exercise list -> open detail.
- [x] 15.3 Test flow: open plans -> open one plan.
- [x] 15.4 Test flow: dashboard heatmap click -> filtered logs.
- [x] 15.5 Confirm shared `Exercise` data is used across Log/Guide/Plan.
- [x] 15.6 Tag MVP complete in `README.md`.

## 16. Post-MVP Tasks

- [x] 16.1 Add edit existing log session.
- [x] 16.2 Add delete session and delete set actions.
- [x] 16.3 Add rest timer workflow in new log UI.
- [x] 16.4 Add auto progression suggestion from history.
- [x] 16.5 Add volume analytics by muscle group.
- [x] 16.6 Add auth and cloud sync.
