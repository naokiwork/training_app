import { getUserIdFromCookieStore } from "@/lib/auth";
import { isPremium } from "@/lib/entitlements";
import { LogPageClient } from "./LogPageClient";

export default async function LogPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const selectedDate = params.date ?? new Date().toISOString().slice(0, 10);
  const userId = await getUserIdFromCookieStore();
  const premium = userId ? await isPremium(userId) : false;

  return <LogPageClient initialDate={selectedDate} premium={premium} />;
}
