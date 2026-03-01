import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { isPremium } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateList(days: number) {
  const result: string[] = [];
  const current = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(current);
    d.setDate(current.getDate() - i);
    result.push(formatDate(d));
  }
  return result;
}

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = z.coerce.number().int().min(7).max(365).safeParse(request.nextUrl.searchParams.get("days") ?? 84);
  const requestedDays = parsed.success ? parsed.data : 84;
  const premium = await isPremium(userId);
  const days = premium ? requestedDays : Math.min(requestedDays, 84);
  const dates = getDateList(days);
  const from = dates[0];

  const sessions = await prisma.workoutSession.findMany({
    where: { userId, date: { gte: from } },
    include: {
      exercises: {
        include: {
          sets: true,
        },
      },
    },
  });

  const byDate = new Map<string, number>();
  for (const date of dates) byDate.set(date, 0);

  for (const session of sessions) {
    let sets = 0;
    for (const exercise of session.exercises) {
      sets += exercise.sets.length;
    }
    byDate.set(session.date, (byDate.get(session.date) ?? 0) + sets);
  }

  const payload = dates.map((date) => ({ date, sets: byDate.get(date) ?? 0 }));
  return NextResponse.json({ premium, days, data: payload });
}
