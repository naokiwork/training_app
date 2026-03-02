import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ user: null });
  }
  const user = await getPrisma().user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, createdAt: true },
  });
  return NextResponse.json({ user });
}
