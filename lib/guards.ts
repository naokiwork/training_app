import { getPrisma } from "@/lib/prisma";

export async function assertOwnsSession(userId: string, sessionId: string) {
  const session = await getPrisma().workoutSession.findFirst({
    where: { id: sessionId, userId },
    select: { id: true },
  });
  if (!session) throw new Error("FORBIDDEN_SESSION");
}
