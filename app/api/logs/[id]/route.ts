import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { assertOwnsSession } from "@/lib/guards";
import { allowRequest, getRateLimitKeyFromRequestLike } from "@/lib/rate-limit";
import { CreateOrUpdateLogSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { logError, logInfo } from "@/lib/monitor";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const key = `logs-patch:${getRateLimitKeyFromRequestLike(request)}`;
    if (!allowRequest(key, 80, 60_000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const { id } = await params;
    const payload = await request.json().catch(() => null);
    const parsed = CreateOrUpdateLogSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    const data = parsed.data;

    try {
      await assertOwnsSession(userId, id);
    } catch {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.workoutExercise.deleteMany({ where: { sessionId: id } });
      return tx.workoutSession.update({
        where: { id },
        data: {
          userId,
          date: data.date,
          painFlag: Boolean(data.painFlag),
          exercises: {
            create: data.exercises.map((exercise, exerciseIndex) => ({
              exerciseId: exercise.exerciseId,
              exerciseOrder: exerciseIndex,
              sets: {
                create: exercise.sets.map((set, setIndex) => ({
                  setOrder: setIndex,
                  reps: set.reps,
                  rpe: set.rpe,
                  restSeconds: set.restSeconds,
                  formQualityFlag: Boolean(set.formQualityFlag),
                })),
              },
            })),
          },
        },
        select: { id: true, date: true },
      });
    });

    logInfo("log_updated", { userId, sessionId: updated.id });
    return NextResponse.json({ id: updated.id, date: updated.date });
  } catch (error) {
    logError("log_update_failed", { error: String(error) });
    return NextResponse.json({ error: "Failed to update session." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const key = `logs-delete:${getRateLimitKeyFromRequestLike(request)}`;
    if (!allowRequest(key, 80, 60_000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const { id } = await params;
    try {
      await assertOwnsSession(userId, id);
    } catch {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    await prisma.workoutSession.delete({ where: { id } });
    logInfo("log_deleted", { userId, sessionId: id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logError("log_delete_failed", { error: String(error) });
    return NextResponse.json({ error: "Failed to delete session." }, { status: 500 });
  }
}
