import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type ProgressionItem = {
  exerciseId: string;
  exerciseName: string;
  message: string;
  lastAverageReps: number | null;
  previousAverageReps: number | null;
};

function averageReps(reps: number[]) {
  if (reps.length === 0) return 0;
  return reps.reduce((sum, value) => sum + value, 0) / reps.length;
}

function buildMessage(last: number | null, previous: number | null) {
  if (last === null) {
    return "No history yet. Start with clean reps and consistent rest.";
  }
  if (previous === null) {
    if (last >= 10) return "Strong first baseline. Try +1 rep next session.";
    if (last >= 6) return "Solid baseline. Keep form and add reps gradually.";
    return "Baseline is low. Keep assistance/regression and build consistency.";
  }

  const diff = Number((last - previous).toFixed(1));
  if (diff >= 1) {
    return `Trend is improving (+${diff} avg reps). Add 1 rep or a harder variation soon.`;
  }
  if (diff <= -1) {
    return `Trend dropped (${diff} avg reps). Keep current variation and recover before progressing.`;
  }
  if (last >= 10) {
    return "Stable and high reps. Consider a harder variation or slower tempo.";
  }
  return "Stable trend. Keep variation and target +1 total rep next session.";
}

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const parsedIds = z.array(z.string().min(1)).max(30).safeParse(ids);
  if (!parsedIds.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  if (parsedIds.data.length === 0) {
    return NextResponse.json([]);
  }

  const results: ProgressionItem[] = [];

  for (const exerciseId of parsedIds.data) {
    const history = await prisma.workoutExercise.findMany({
      where: { exerciseId, session: { userId } },
      include: {
        exercise: { select: { name: true } },
        session: { select: { createdAt: true } },
        sets: { select: { reps: true } },
      },
      orderBy: { session: { createdAt: "desc" } },
      take: 2,
    });

    const exerciseName = history[0]?.exercise.name ?? "Unknown";

    const lastSetReps = history[0]?.sets.map((set) => set.reps) ?? [];
    const prevSetReps = history[1]?.sets.map((set) => set.reps) ?? [];

    const lastAverage = history[0] ? Number(averageReps(lastSetReps).toFixed(1)) : null;
    const previousAverage = history[1] ? Number(averageReps(prevSetReps).toFixed(1)) : null;

    results.push({
      exerciseId,
      exerciseName,
      message: buildMessage(lastAverage, previousAverage),
      lastAverageReps: lastAverage,
      previousAverageReps: previousAverage,
    });
  }

  return NextResponse.json(results);
}
