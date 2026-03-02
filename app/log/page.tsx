import { LogPageClient } from "./LogPageClient";

export default async function LogPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const selectedDate = params.date ?? new Date().toISOString().slice(0, 10);
  const premium = false;

  return <LogPageClient initialDate={selectedDate} premium={premium} />;
}
