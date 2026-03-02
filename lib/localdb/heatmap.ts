import { buildHeatmapFromDailyCounts } from "@/core/heatmap";
import { getDailyCounts } from "@/lib/localdb/repo";

type HeatmapCell = { date: string; sets: number };

export async function buildHeatmap(days = 84): Promise<HeatmapCell[]> {
  const dailyCounts = await getDailyCounts();
  return buildHeatmapFromDailyCounts(days, dailyCounts);
}
