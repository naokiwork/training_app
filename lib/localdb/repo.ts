import { getLocalDb } from "@/lib/localdb/db";
import {
  LocalExerciseCache,
  LocalSession,
  LocalSessionDetail,
  LocalSessionExercise,
  LocalSet,
  UpsertLocalSessionInput,
} from "@/lib/localdb/types";
import { CourseDayTemplate, getCourseById } from "@/data/courses";
import { calculateCurrentStreak } from "@/core/streak";
import { countThisWeek, isTodayLogged } from "@/core/weeklyStats";

const DAILY_COUNTS_KEY = "dailyCounts";
const LAST_SET_DRAFT_KEY = "lastSetDraft";

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function normalizeDate(date: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  return new Date().toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function cacheExercises(exercises: Array<{ id: string; name: string; category?: string | null }>) {
  const db = await getLocalDb();
  const tx = db.transaction("exercises", "readwrite");
  const now = Date.now();
  for (const exercise of exercises) {
    await tx.store.put({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category ?? undefined,
      updatedAt: now,
    });
  }
  await tx.done;
}

export async function listCachedExercises() {
  const db = await getLocalDb();
  const rows = await db.getAll("exercises");
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getExerciseMapByIds(ids: string[]) {
  const db = await getLocalDb();
  const map = new Map<string, LocalExerciseCache>();
  for (const id of ids) {
    const row = await db.get("exercises", id);
    if (row) map.set(id, row);
  }
  return map;
}

export async function upsertSessionWithDetails(input: UpsertLocalSessionInput) {
  const db = await getLocalDb();
  const tx = db.transaction(["sessions", "sessionExercises", "sets"], "readwrite");
  const now = Date.now();
  const id = input.id ?? createId();

  const existing = await tx.objectStore("sessions").get(id);
  const previousDate = existing?.date;
  const createdAt = existing?.createdAt ?? now;

  await tx.objectStore("sessions").put({
    id,
    date: normalizeDate(input.date),
    notes: input.notes?.trim() || undefined,
    painFlag: Boolean(input.painFlag),
    createdAt,
    updatedAt: now,
  });

  const oldBlocks = await tx.objectStore("sessionExercises").index("bySessionId").getAll(id);
  for (const block of oldBlocks) {
    const oldSets = await tx.objectStore("sets").index("bySessionExerciseId").getAll(block.id);
    for (const set of oldSets) {
      await tx.objectStore("sets").delete(set.id);
    }
    await tx.objectStore("sessionExercises").delete(block.id);
  }

  for (const [exerciseOrder, exercise] of input.exercises.entries()) {
    const sessionExerciseId = createId();
    await tx.objectStore("sessionExercises").put({
      id: sessionExerciseId,
      sessionId: id,
      exerciseId: exercise.exerciseId,
      exerciseOrder,
      createdAt: now,
      updatedAt: now,
    });

    for (const [setOrder, set] of exercise.sets.entries()) {
      await tx.objectStore("sets").put({
        id: createId(),
        sessionExerciseId,
        setOrder,
        reps: set.reps,
        weightKg: typeof set.weightKg === "number" ? set.weightKg : undefined,
        rpe: typeof set.rpe === "number" ? set.rpe : undefined,
        restSeconds: typeof set.restSeconds === "number" ? set.restSeconds : undefined,
        formQualityFlag: Boolean(set.formQualityFlag),
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  await tx.done;
  await ensureDailyCounts();
  if (previousDate) await updateDailyCountForDate(previousDate);
  await updateDailyCountForDate(normalizeDate(input.date));
  const lastExercise = input.exercises[input.exercises.length - 1];
  const lastSet = lastExercise?.sets[lastExercise.sets.length - 1];
  if (lastExercise && lastSet) {
    const exercise = await getLocalDb().then((db) => db.get("exercises", lastExercise.exerciseId));
    await saveLastSetDraft({
      exerciseId: lastExercise.exerciseId,
      exerciseName: exercise?.name,
      reps: lastSet.reps,
      weightKg: lastSet.weightKg,
      rpe: lastSet.rpe,
      restSeconds: lastSet.restSeconds,
      formQualityFlag: lastSet.formQualityFlag,
    });
  }
  return { id, date: normalizeDate(input.date) };
}

export async function deleteSession(sessionId: string) {
  const db = await getLocalDb();
  const existing = await db.get("sessions", sessionId);
  const tx = db.transaction(["sessions", "sessionExercises", "sets"], "readwrite");
  const blocks = await tx.objectStore("sessionExercises").index("bySessionId").getAll(sessionId);
  for (const block of blocks) {
    const sets = await tx.objectStore("sets").index("bySessionExerciseId").getAll(block.id);
    for (const set of sets) {
      await tx.objectStore("sets").delete(set.id);
    }
    await tx.objectStore("sessionExercises").delete(block.id);
  }
  await tx.objectStore("sessions").delete(sessionId);
  await tx.done;
  await ensureDailyCounts();
  if (existing?.date) await updateDailyCountForDate(existing.date);
}

export async function listSessionsByDate(date: string) {
  const db = await getLocalDb();
  const day = normalizeDate(date);
  return db.getAllFromIndex("sessions", "byDate", day);
}

export async function listSessionsByDateRange(fromDate: string, toDate: string) {
  const db = await getLocalDb();
  const all = await db.getAll("sessions");
  return all
    .filter((session) => session.date >= fromDate && session.date <= toDate)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getSessionDetail(sessionId: string): Promise<LocalSessionDetail | null> {
  const db = await getLocalDb();
  const session = await db.get("sessions", sessionId);
  if (!session) return null;

  const blocks = await db.getAllFromIndex("sessionExercises", "bySessionId", sessionId);
  blocks.sort((a, b) => a.exerciseOrder - b.exerciseOrder);

  const exerciseMap = await getExerciseMapByIds(blocks.map((block) => block.exerciseId));
  const exercises = [];
  for (const block of blocks) {
    const sets = await db.getAllFromIndex("sets", "bySessionExerciseId", block.id);
    sets.sort((a, b) => a.setOrder - b.setOrder);
    const exercise = exerciseMap.get(block.exerciseId);
    exercises.push({
      id: block.id,
      exerciseId: block.exerciseId,
      exerciseName: exercise?.name ?? "Unknown",
      category: exercise?.category,
      exerciseOrder: block.exerciseOrder,
      sets: sets.map((set) => ({
        id: set.id,
        setOrder: set.setOrder,
        reps: set.reps,
        weightKg: set.weightKg,
        rpe: set.rpe,
        restSeconds: set.restSeconds,
        formQualityFlag: set.formQualityFlag,
      })),
    });
  }

  return {
    id: session.id,
    date: session.date,
    notes: session.notes,
    painFlag: session.painFlag,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    exercises,
  };
}

export async function listSessionDetailsByDate(date: string): Promise<LocalSessionDetail[]> {
  const sessions = await listSessionsByDate(date);
  sessions.sort((a, b) => b.createdAt - a.createdAt);
  const results: LocalSessionDetail[] = [];
  for (const session of sessions) {
    const detail = await getSessionDetail(session.id);
    if (detail) results.push(detail);
  }
  return results;
}

export async function listRecentSessions(days: number): Promise<LocalSession[]> {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - Math.max(0, days - 1));
  const fromDate = from.toISOString().slice(0, 10);
  const toDate = to.toISOString().slice(0, 10);
  return listSessionsByDateRange(fromDate, toDate);
}

export async function listAllSessions(): Promise<LocalSession[]> {
  const db = await getLocalDb();
  return db.getAll("sessions");
}

export async function getLatestSessionDetail() {
  const all = await listAllSessions();
  if (all.length === 0) return null;
  all.sort((a, b) => b.updatedAt - a.updatedAt);
  return getSessionDetail(all[0].id);
}

export async function listRecentSessionDetails(limit = 8): Promise<LocalSessionDetail[]> {
  const all = await listAllSessions();
  all.sort((a, b) => b.updatedAt - a.updatedAt);
  const picked = all.slice(0, Math.max(0, limit));
  const details = await Promise.all(picked.map((session) => getSessionDetail(session.id)));
  return details.filter((item): item is LocalSessionDetail => Boolean(item));
}

export async function saveQuickSession(exerciseId: string, reps: number, date = today()) {
  const result = await upsertSessionWithDetails({
    date,
    painFlag: false,
    exercises: [{ exerciseId, sets: [{ reps, formQualityFlag: false, restSeconds: 90 }] }],
  });
  const exercise = await getLocalDb().then((db) => db.get("exercises", exerciseId));
  await saveLastSetDraft({
    exerciseId,
    exerciseName: exercise?.name,
    reps,
    restSeconds: 90,
    formQualityFlag: false,
  });
  return result;
}

export async function repeatLastSession(date = today()) {
  const last = await getLatestSessionDetail();
  if (!last) return null;
  const result = await upsertSessionWithDetails({
    date,
    painFlag: last.painFlag,
    notes: last.notes,
    exercises: last.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: exercise.sets.map((set) => ({
        reps: set.reps,
        rpe: set.rpe,
        restSeconds: set.restSeconds,
        formQualityFlag: set.formQualityFlag,
      })),
    })),
  });
  return result;
}

type DailyCounts = Record<string, number>;

async function readDailyCounts(): Promise<DailyCounts> {
  const db = await getLocalDb();
  const row = await db.get("meta", DAILY_COUNTS_KEY);
  if (!row || typeof row.value !== "object" || !row.value) return {};
  return row.value as DailyCounts;
}

async function writeDailyCounts(value: DailyCounts) {
  const db = await getLocalDb();
  await db.put("meta", { key: DAILY_COUNTS_KEY, value });
}

export async function ensureDailyCounts() {
  const current = await readDailyCounts();
  if (Object.keys(current).length > 0) return current;

  const sessions = await listAllSessions();
  const rebuilt: DailyCounts = {};
  for (const session of sessions) {
    rebuilt[session.date] = (rebuilt[session.date] ?? 0) + 1;
  }
  await writeDailyCounts(rebuilt);
  return rebuilt;
}

export async function getDailyCounts() {
  return ensureDailyCounts();
}

export async function updateDailyCountForDate(date: string) {
  const normalized = normalizeDate(date);
  const db = await getLocalDb();
  const sessions = await db.getAllFromIndex("sessions", "byDate", normalized);
  const counts = await ensureDailyCounts();
  if (sessions.length === 0) {
    delete counts[normalized];
  } else {
    counts[normalized] = sessions.length;
  }
  await writeDailyCounts(counts);
}

export async function getDashboardStats() {
  const sessions = await listAllSessions();
  const dates = sessions.map((session) => session.date);
  return {
    streak: calculateCurrentStreak(dates),
    thisWeekCount: countThisWeek(dates),
    todayLogged: isTodayLogged(dates),
  };
}

export type LastSetDraft = {
  exerciseId: string;
  exerciseName?: string;
  reps: number;
  weightKg?: number;
  rpe?: number;
  restSeconds?: number;
  formQualityFlag?: boolean;
  updatedAt: number;
};

export async function saveLastSetDraft(input: Omit<LastSetDraft, "updatedAt">) {
  const db = await getLocalDb();
  await db.put("meta", {
    key: LAST_SET_DRAFT_KEY,
    value: {
      ...input,
      updatedAt: Date.now(),
    } satisfies LastSetDraft,
  });
}

export async function getLastSetDraft(): Promise<LastSetDraft | null> {
  const db = await getLocalDb();
  const row = await db.get("meta", LAST_SET_DRAFT_KEY);
  if (!row || typeof row.value !== "object" || !row.value) return null;
  return row.value as LastSetDraft;
}

export async function listRecentSetDrafts(limit = 3): Promise<LastSetDraft[]> {
  const db = await getLocalDb();
  const allSets = await db.getAll("sets");
  allSets.sort((a, b) => b.updatedAt - a.updatedAt);
  const picked = allSets.slice(0, Math.max(0, limit));

  const sessionExerciseIds = picked.map((set) => set.sessionExerciseId);
  const blocks = await Promise.all(sessionExerciseIds.map((id) => db.get("sessionExercises", id)));
  const exerciseIds = blocks.map((block) => block?.exerciseId).filter((value): value is string => Boolean(value));
  const exerciseMap = await getExerciseMapByIds(exerciseIds);

  return picked.map((set, index) => {
    const block = blocks[index];
    const exercise = block ? exerciseMap.get(block.exerciseId) : undefined;
    return {
      exerciseId: block?.exerciseId ?? "unknown",
      exerciseName: exercise?.name ?? "Unknown",
      reps: set.reps,
      weightKg: set.weightKg,
      rpe: set.rpe,
      restSeconds: set.restSeconds,
      formQualityFlag: set.formQualityFlag,
      updatedAt: set.updatedAt,
    };
  });
}

export async function getCourseDayExercises(courseId: string, dayIndex: number): Promise<{
  exerciseId: string;
  exerciseName: string;
  sets: number;
  repRange: string;
}[]> {
  const course = getCourseById(courseId);
  if (!course || !course.days[dayIndex]) return [];

  const dayTemplate = course.days[dayIndex];
  const cachedExercises = await listCachedExercises();
  const exerciseMap = new Map(cachedExercises.map(ex => [ex.id, ex]));

  return dayTemplate.items.map(item => ({
    exerciseId: item.exerciseId || cachedExercises.find(ex => ex.name === item.exerciseName)?.id || createId(),
    exerciseName: item.exerciseName,
    sets: item.sets,
    repRange: item.repRange,
  }));
}
