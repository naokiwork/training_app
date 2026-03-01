import { listRecentSessions } from "@/lib/localdb/repo";

type HeatmapCell = {
  date: string;
  sets: number;
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateWindow(days: number) {
  const result: string[] = [];
  const current = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(current);
    d.setDate(current.getDate() - i);
    result.push(formatDate(d));
  }
  return result;
}

export async function buildHeatmap(days = 84): Promise<HeatmapCell[]> {
  const dateWindow = getDateWindow(days);
  const sessions = await listRecentSessions(days);
  const byDate = new Map<string, number>();
  for (const date of dateWindow) byDate.set(date, 0);

  for (const session of sessions) {
    // Local-first simplified contribution: each session contributes one unit.
    byDate.set(session.date, (byDate.get(session.date) ?? 0) + 1);
  }

  return dateWindow.map((date) => ({ date, sets: byDate.get(date) ?? 0 }));
}
