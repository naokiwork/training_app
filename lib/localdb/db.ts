import { DBSchema, IDBPDatabase, openDB } from "idb";
import {
  LocalExerciseCache,
  LocalSession,
  LocalSessionExercise,
  LocalSet,
  CourseEnrollment,
  CourseProgress,
} from "@/lib/localdb/types";

type MetaValue = {
  key: string;
  value: unknown;
};

interface TrainingLocalDbSchema extends DBSchema {
  sessions: {
    key: string;
    value: LocalSession;
    indexes: {
      byDate: string;
      byUpdatedAt: number;
    };
  };
  sessionExercises: {
    key: string;
    value: LocalSessionExercise;
    indexes: {
      bySessionId: string;
    };
  };
  sets: {
    key: string;
    value: LocalSet;
    indexes: {
      bySessionExerciseId: string;
    };
  };
  exercises: {
    key: string;
    value: LocalExerciseCache;
    indexes: {
      byName: string;
      byUpdatedAt: number;
    };
  };
  meta: {
    key: string;
    value: MetaValue;
  };
  courseEnrollments: {
    key: string;
    value: CourseEnrollment;
    indexes: {
      byCourseId: string;
      byStartedAt: string;
      byUpdatedAt: number;
    };
  };
  courseProgresses: {
    key: string;
    value: CourseProgress;
    indexes: {
      byEnrollmentId: string;
      bySessionId: string;
      byCompletedAt: number;
    };
  };
}

const DB_NAME = "training-local-db";
export const runtime = "nodejs";

const DB_VERSION = 2;


let dbPromise: Promise<IDBPDatabase<TrainingLocalDbSchema>> | null = null;

export function getLocalDb() {
  if (!dbPromise) {
    dbPromise = openDB<TrainingLocalDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("sessions")) {
          const store = db.createObjectStore("sessions", { keyPath: "id" });
          store.createIndex("byDate", "date");
          store.createIndex("byUpdatedAt", "updatedAt");
        }
        if (!db.objectStoreNames.contains("sessionExercises")) {
          const store = db.createObjectStore("sessionExercises", { keyPath: "id" });
          store.createIndex("bySessionId", "sessionId");
        }
        if (!db.objectStoreNames.contains("sets")) {
          const store = db.createObjectStore("sets", { keyPath: "id" });
          store.createIndex("bySessionExerciseId", "sessionExerciseId");
        }
        if (!db.objectStoreNames.contains("exercises")) {
          const store = db.createObjectStore("exercises", { keyPath: "id" });
          store.createIndex("byName", "name");
          store.createIndex("byUpdatedAt", "updatedAt");
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("courseEnrollments")) {
          const store = db.createObjectStore("courseEnrollments", { keyPath: "id" });
          store.createIndex("byCourseId", "courseId");
          store.createIndex("byStartedAt", "startedAt");
          store.createIndex("byUpdatedAt", "updatedAt");
        }
        if (!db.objectStoreNames.contains("courseProgresses")) {
          const store = db.createObjectStore("courseProgresses", { keyPath: "id" });
          store.createIndex("byEnrollmentId", "enrollmentId");
          store.createIndex("bySessionId", "sessionId");
          store.createIndex("byCompletedAt", "completedAt");
        }
      },
    });
  }
  return dbPromise;
}
