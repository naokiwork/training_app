export type DailyCounts = Record<string, number>;

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getDateWindow(days: number) {
  const result: string[] = [];
  const current = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(current);
    d.setDate(current.getDate() - i);
    result.push(formatDate(d));
  }
  return result;
}

export function buildHeatmapFromDailyCounts(days: number, dailyCounts: DailyCounts) {
  const dateWindow = getDateWindow(days);
  return dateWindow.map((date) => ({
    date,
    sets: dailyCounts[date] ?? 0,
  }));
}
