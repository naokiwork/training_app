import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const latest = await prisma.cloudSyncSnapshot.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, payload: true, version: true, checksum: true },
  });

  if (!latest) {
    return NextResponse.json({ snapshot: null });
  }

  return NextResponse.json({
    snapshot: {
      id: latest.id,
      version: latest.version,
      checksum: latest.checksum,
      createdAt: latest.createdAt.toISOString(),
      payload: latest.payload,
    },
  });
}
