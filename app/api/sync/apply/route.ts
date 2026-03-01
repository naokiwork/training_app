import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/auth";
import { allowRequest, getRateLimitKeyFromRequestLike } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { logError, logInfo } from "@/lib/monitor";

const SnapshotSetSchema = z.object({
  reps: z.number().int().min(0).max(500),
  rpe: z.number().min(0).max(10).nullable().optional(),
  restSeconds: z.number().int().min(0).max(3600).nullable().optional(),
  formQualityFlag: z.boolean().optional(),
});

const SnapshotExerciseSchema = z.object({
  exerciseId: z.string().optional(),
  exercise: z
    .object({
      name: z.string().min(1).optional(),
    })
    .optional(),
  sets: z.array(SnapshotSetSchema).min(1),
});

const SnapshotSessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().nullable().optional(),
  painFlag: z.boolean().optional(),
  exercises: z.array(SnapshotExerciseSchema).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const key = `sync-apply:${getRateLimitKeyFromRequestLike(request)}`;
    if (!allowRequest(key, 20, 60_000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const latest = await prisma.cloudSyncSnapshot.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, version: true, checksum: true, payload: true },
    });

    if (!latest) {
      return NextResponse.json({ error: "No snapshot found." }, { status: 404 });
    }

    const payload = latest.payload as unknown;
    const expectedChecksum = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    if (expectedChecksum !== latest.checksum) {
      return NextResponse.json({ error: "Snapshot checksum mismatch." }, { status: 409 });
    }

    if (!Array.isArray(payload)) {
      return NextResponse.json({ error: "Snapshot payload is invalid." }, { status: 400 });
    }

    const parsedSessions = z.array(SnapshotSessionSchema).safeParse(payload);
    if (!parsedSessions.success) {
      return NextResponse.json({ error: "Snapshot payload is invalid." }, { status: 400 });
    }
    const sessions = parsedSessions.data;
    let restoredSessions = 0;

    await prisma.$transaction(async (tx) => {
      await tx.workoutSession.deleteMany({ where: { userId } });

      for (const session of sessions) {
        const exerciseCreates = [];
        for (const block of session.exercises) {
          let exerciseId = block.exerciseId;
          if (!exerciseId && block.exercise?.name) {
            const existing = await tx.exercise.findUnique({
              where: { name: block.exercise.name },
              select: { id: true },
            });
            exerciseId = existing?.id;
          }
          if (!exerciseId) continue;

          const sets = block.sets;
          if (sets.length === 0) continue;

          exerciseCreates.push({
            exerciseId,
            sets: {
              create: sets.map((set, setIndex) => ({
                setOrder: setIndex,
                reps: set.reps,
                rpe: typeof set.rpe === "number" ? set.rpe : undefined,
                restSeconds: typeof set.restSeconds === "number" ? set.restSeconds : undefined,
                formQualityFlag: Boolean(set.formQualityFlag),
              })),
            },
          });
        }

        if (exerciseCreates.length === 0) continue;

        await tx.workoutSession.create({
          data: {
            userId,
            date: session.date,
            notes: session.notes ?? null,
            painFlag: Boolean(session.painFlag),
            exercises: { create: exerciseCreates },
          },
        });
        restoredSessions += 1;
      }
    });

    logInfo("sync_apply_completed", { userId, snapshotId: latest.id, restoredSessions });
    return NextResponse.json({
      ok: true,
      snapshotId: latest.id,
      version: latest.version,
      restoredSessions,
    });
  } catch (error) {
    logError("sync_apply_failed", { error: String(error) });
    return NextResponse.json({ error: "Apply failed." }, { status: 500 });
  }
}
