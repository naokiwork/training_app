import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getUserIdFromRequest } from "@/lib/auth";
import { allowRequest, getRateLimitKeyFromRequestLike } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { logError, logInfo } from "@/lib/monitor";

export async function POST(request: NextRequest) {
  try {
    const key = `sync-push:${getRateLimitKeyFromRequestLike(request)}`;
    if (!allowRequest(key, 30, 60_000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });
    const payload = JSON.stringify(sessions);
    const checksum = createHash("sha256").update(payload).digest("hex");

    const snapshot = await prisma.cloudSyncSnapshot.create({
      data: {
        userId,
        version: 1,
        checksum,
        payload: sessions,
      },
      select: { id: true, createdAt: true, version: true, checksum: true },
    });

    logInfo("sync_push_completed", { userId, snapshotId: snapshot.id });
    return NextResponse.json({
      snapshotId: snapshot.id,
      version: snapshot.version,
      checksum: snapshot.checksum,
      createdAt: snapshot.createdAt.toISOString(),
      sessionCount: sessions.length,
    });
  } catch (error) {
    logError("sync_push_failed", { error: String(error) });
    return NextResponse.json({ error: "Push failed." }, { status: 500 });
  }
}
