import { getPrisma } from "@/lib/prisma";

export async function getSubscription(userId: string) {
  return getPrisma().subscription.findUnique({ where: { userId } });
}

export async function isPremium(userId: string) {
  const sub = await getSubscription(userId);
  if (!sub) return false;
  if (!["trialing", "active"].includes(sub.status)) return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() < Date.now()) return false;
  return true;
}
