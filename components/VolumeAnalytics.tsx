"use client";

import { useEffect, useMemo, useState } from "react";

type VolumeRow = {
  muscleGroup: string;
  sets: number;
  reps: number;
};
type ErrorResponse = { error?: string };

export function VolumeAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<VolumeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`/api/analytics/volume?days=${days}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          setError("Failed to load volume analytics.");
          setLoading(false);
          return;
        }
        const rows = (await response.json()) as VolumeRow[] | ErrorResponse;
        setData(Array.isArray(rows) ? rows : []);
      } catch {
        setError("Failed to load volume analytics.");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [days]);

  const maxSets = useMemo(() => Math.max(...data.map((row) => row.sets), 1), [data]);

  return (
    <section className="space-y-3 rounded-lg border border-slate-800 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Volume by Muscle Group</h2>
        <select
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
        >
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {loading ? <p className="text-sm text-slate-400">Loading analytics...</p> : null}
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {!loading && !error && data.length === 0 ? (
        <p className="text-sm text-slate-400">No volume data yet.</p>
      ) : null}

      {!loading && !error && data.length > 0 ? (
        <ul className="space-y-2">
          {data.map((row) => (
            <li key={row.muscleGroup} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize text-slate-200">{row.muscleGroup}</span>
                <span className="text-slate-400">
                  {row.sets} sets / {row.reps} reps
                </span>
              </div>
              <div className="h-2 rounded bg-slate-900">
                <div
                  className="h-2 rounded bg-indigo-500"
                  style={{ width: `${Math.max(8, (row.sets / maxSets) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
