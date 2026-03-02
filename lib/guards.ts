import { getPrisma } from "@/lib/prisma";

export async function assertOwnsSession(userId: string, sessionId: string) {
  throw new Error("Server-side session ownership checks are disabled.");
}
