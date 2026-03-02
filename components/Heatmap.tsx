"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buildHeatmap } from "@/lib/localdb/heatmap";

type Contribution = {
  date: string;
  sets: number;
};

function getLevel(sets: number, max: number) {
  if (sets === 0) return 0;
  if (max <= 1) return 2;
  const ratio = sets / max;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
}

const colors = [
  "bg-slate-800",
  "bg-emerald-900",
  "bg-emerald-700",
  "bg-emerald-500",
  "bg-emerald-300",
];

export function Heatmap() {
  const router = useRouter();
  const [data, setData] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const rows = (await buildHeatmap(365)) as Contribution[];
        setData(rows);
      } catch {
        setError("Failed to load heatmap.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="rounded border border-slate-800 p-4 text-sm text-slate-400">Loading heatmap...</div>;
  }

  if (error) {
    return <div className="rounded border border-slate-800 p-4 text-sm text-rose-400">{error}</div>;
  }

  if (data.length === 0) {
    return <div className="rounded border border-slate-800 p-4 text-sm text-slate-400">No data yet.</div>;
  }

  const max = Math.max(...data.map((item) => item.sets), 0);
  const firstDate = new Date(`${data[0].date}T00:00:00`);
  const leadingEmptyCells = firstDate.getDay();
  const cells: Array<Contribution | null> = [
    ...Array.from({ length: leadingEmptyCells }, () => null),
    ...data,
  ];

  return (
    <div className="space-y-2 rounded border border-slate-800 p-4">
      <h2 className="text-sm font-semibold text-slate-200">Training Contributions (last 365 days)</h2>
      <div className="grid auto-cols-max grid-flow-col grid-rows-7 gap-px">
        {cells.map((item, index) => {
          if (!item) {
            return <div key={`empty-${index}`} className="h-3 w-3" aria-hidden />;
          }
          const level = getLevel(item.sets, max);
          return (
            <button
              key={item.date}
              type="button"
              onClick={() => router.push(`/log?date=${item.date}`)}
              title={`${item.date}: ${item.sets} sets`}
              className={`h-3 w-3 rounded-[2px] ${colors[level]} hover:ring-1 hover:ring-slate-200`}
              aria-label={`${item.date}: ${item.sets} sets`}
            />
          );
        })}
      </div>
      <p className="text-xs text-slate-400">Click a day to open the log filtered by date.</p>
    </div>
  );
}
