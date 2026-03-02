"use client";

import { useEffect, useRef, useState } from "react";
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

const GRID_ROWS = 7;
const CELL_SIZE_PX = 12; // Tailwind h-3/w-3
const CELL_GAP_PX = 1; // gap-px

export function Heatmap() {
  const router = useRouter();
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<Contribution[]>([]);
  const [days, setDays] = useState(365);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const node = gridContainerRef.current;
    if (!node) return;

    const updateDaysByWidth = () => {
      const width = node.clientWidth;
      const columns = Math.max(1, Math.floor((width + CELL_GAP_PX) / (CELL_SIZE_PX + CELL_GAP_PX)));
      const nextDays = columns * GRID_ROWS;
      setDays((prev) => (prev === nextDays ? prev : nextDays));
    };

    updateDaysByWidth();
    const observer = new ResizeObserver(updateDaysByWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const rows = (await buildHeatmap(days)) as Contribution[];
        setData(rows);
      } catch {
        setError("Failed to load heatmap.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [days]);

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

  return (
    <div className="space-y-2 rounded border border-slate-800 p-4">
      <h2 className="text-sm font-semibold text-slate-200">Training Contributions (last {data.length} days)</h2>
      <div ref={gridContainerRef} className="w-full overflow-hidden">
        <div className="grid auto-cols-max grid-flow-col grid-rows-7 gap-px">
          {data.map((item) => {
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
      </div>
      <p className="text-xs text-slate-400">Click a day to open the log filtered by date.</p>
    </div>
  );
}
