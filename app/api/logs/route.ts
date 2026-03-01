import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { isPremium } from "@/lib/entitlements";
import { allowRequest, getRateLimitKeyFromRequestLike } from "@/lib/rate-limit";
import { CreateOrUpdateLogSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { logError, logInfo } from "@/lib/monitor";

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  try {
    const key = `logs-post:${getRateLimitKeyFromRequestLike(request)}`;
    if (!allowRequest(key, 60, 60_000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const payload = await request.json().catch(() => null);
    const parsed = CreateOrUpdateLogSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    const data = parsed.data;

    const session = await prisma.workoutSession.create({
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

    logInfo("log_created", { userId, sessionId: session.id });
    return NextResponse.json({ id: session.id, date: session.date }, { status: 201 });
  } catch (error) {
    logError("log_create_failed", { error: String(error) });
    return NextResponse.json({ error: "Failed to create log session." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const date = request.nextUrl.searchParams.get("date") ?? undefined;
    const premium = await isPremium(userId);
    const minDate = premium ? undefined : daysAgoIso(30);

    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        ...(date ? { date } : {}),
        ...(minDate ? { date: { gte: minDate } } : {}),
      },
      orderBy: { date: "desc" },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: { orderBy: { setOrder: "asc" } },
          },
          orderBy: { exerciseOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ premium, minDate: minDate ?? null, sessions });
  } catch (error) {
    logError("log_fetch_failed", { error: String(error) });
    return NextResponse.json({ error: "Failed to fetch logs." }, { status: 500 });
  }
}
