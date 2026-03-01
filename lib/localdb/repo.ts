import { getLocalDb } from "@/lib/localdb/db";
import type {
  LocalExerciseCache,
  LocalSession,
  LocalSessionDetail,
  LocalSessionExercise,
  LocalSet,
  UpsertLocalSessionInput,
} from "@/lib/localdb/types";

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
        rpe: typeof set.rpe === "number" ? set.rpe : undefined,
        restSeconds: typeof set.restSeconds === "number" ? set.restSeconds : undefined,
        formQualityFlag: Boolean(set.formQualityFlag),
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  await tx.done;
  return { id, date: normalizeDate(input.date) };
}

export async function deleteSession(sessionId: string) {
  const db = await getLocalDb();
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
