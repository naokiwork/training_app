import { getLocalDb } from "@/lib/localdb/db";

const SCHEMA_VERSION = 1;

type BackupPayload = {
  schemaVersion: number;
  exportedAt: string;
  data: {
    sessions: unknown[];
    sessionExercises: unknown[];
    sets: unknown[];
    exercises: unknown[];
    meta: unknown[];
  };
};

export async function exportLocalBackup(): Promise<BackupPayload> {
  const db = await getLocalDb();
  const [sessions, sessionExercises, sets, exercises, meta] = await Promise.all([
    db.getAll("sessions"),
    db.getAll("sessionExercises"),
    db.getAll("sets"),
    db.getAll("exercises"),
    db.getAll("meta"),
  ]);

  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: { sessions, sessionExercises, sets, exercises, meta },
  };
}

function assertBackupShape(value: unknown): asserts value is BackupPayload {
  if (!value || typeof value !== "object") throw new Error("Invalid backup file.");
  const payload = value as Partial<BackupPayload>;
  if (payload.schemaVersion !== SCHEMA_VERSION) throw new Error("Unsupported schema version.");
  if (!payload.data || typeof payload.data !== "object") throw new Error("Invalid backup payload.");
}

export async function importLocalBackup(value: unknown) {
  assertBackupShape(value);
  const payload = value as BackupPayload;
  const db = await getLocalDb();
  const tx = db.transaction(["sessions", "sessionExercises", "sets", "exercises", "meta"], "readwrite");

  await Promise.all([
    tx.objectStore("sessions").clear(),
    tx.objectStore("sessionExercises").clear(),
    tx.objectStore("sets").clear(),
    tx.objectStore("exercises").clear(),
    tx.objectStore("meta").clear(),
  ]);

  for (const row of payload.data.sessions) await tx.objectStore("sessions").put(row as never);
  for (const row of payload.data.sessionExercises) await tx.objectStore("sessionExercises").put(row as never);
  for (const row of payload.data.sets) await tx.objectStore("sets").put(row as never);
  for (const row of payload.data.exercises) await tx.objectStore("exercises").put(row as never);
  for (const row of payload.data.meta) await tx.objectStore("meta").put(row as never);

  await tx.done;
}
