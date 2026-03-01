import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type VolumeRow = {
  muscleGroup: string;
  sets: number;
  reps: number;
};

function toDateString(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days + 1);
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsedDays = z.coerce
    .number()
    .int()
    .min(7)
    .max(365)
    .safeParse(request.nextUrl.searchParams.get("days") ?? "30");
  if (!parsedDays.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }
  const days = parsedDays.data;
  const fromDate = toDateString(days);

  const sessions = await prisma.workoutSession.findMany({
    where: { userId, date: { gte: fromDate } },
    include: {
      exercises: {
        include: {
          exercise: { select: { category: true } },
          sets: { select: { reps: true } },
        },
      },
    },
  });

  const map = new Map<string, { sets: number; reps: number }>();

  for (const session of sessions) {
    for (const block of session.exercises) {
      const key = block.exercise.category ?? "other";
      if (!map.has(key)) {
        map.set(key, { sets: 0, reps: 0 });
      }
      const target = map.get(key)!;
      target.sets += block.sets.length;
      for (const set of block.sets) {
        target.reps += set.reps;
      }
    }
  }

  const payload: VolumeRow[] = Array.from(map.entries())
    .map(([muscleGroup, values]) => ({
      muscleGroup,
      sets: values.sets,
      reps: values.reps,
    }))
    .sort((a, b) => b.sets - a.sets);

  return NextResponse.json(payload);
}
