"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heatmap } from "@/components/Heatmap";
import { MetadataRow } from "@/components/MetadataRow";
import { PageTabs } from "@/components/PageTabs";
import { getDashboardStats, listRecentSessionDetails } from "@/lib/localdb/repo";
import type { LocalSessionDetail } from "@/lib/localdb/types";

type DashboardStats = {
  streak: number;
  thisWeekCount: number;
  todayLogged: boolean;
};

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats>({
    streak: 0,
    thisWeekCount: 0,
    todayLogged: false,
  });
  const [recentSessions, setRecentSessions] = useState<LocalSessionDetail[]>([]);

  useEffect(() => {
    async function load() {
      const [nextStats, recent] = await Promise.all([getDashboardStats(), listRecentSessionDetails(8)]);
      setStats(nextStats);
      setRecentSessions(recent);
    }
    void load();
  }, []);

  return (
    <section className="space-y-6">
      <PageTabs
        tabs={[
          { href: "/", label: "Dashboard" },
          { href: "/log", label: "Log" },
          { href: "/exercises", label: "Exercises" },
          { href: "/plans", label: "Plans" },
          { href: "/courses", label: "Courses" },
        ]}
      />

      <div className="space-y-3 rounded-lg border border-slate-800 p-6 text-center">
        <h1 className="text-3xl font-bold">3 seconds to log. Build consistency.</h1>
        <p className="text-sm text-slate-400">All data stays on your device.</p>
        <div className="pt-1">
          <Link href="/log/new" className="inline-block rounded bg-black px-4 py-2 text-sm text-white">
            Log Today&apos;s Workout
          </Link>
        </div>
      </div>

      <MetadataRow
        items={[
          { label: "Current Streak", value: `${stats.streak} days` },
          { label: "This Week Count", value: stats.thisWeekCount },
          { label: "Today Logged?", value: stats.todayLogged ? "Yes" : "No" },
        ]}
      />

      <div className="space-y-2 rounded-lg border border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">Edit Past Workouts</h2>
          <Link href="/log" className="text-xs text-slate-400 underline underline-offset-2">
            Open full log
          </Link>
        </div>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-slate-400">No saved workouts yet.</p>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded border border-slate-800 px-3 py-2"
              >
                <div>
                  <p className="text-sm text-slate-200">{session.date}</p>
                  <p className="text-xs text-slate-400">
                    {session.exercises.length} exercises / {session.exercises.reduce((n, ex) => n + ex.sets.length, 0)}{" "}
                    sets
                  </p>
                </div>
                <Link
                  href={`/log/${session.id}/edit`}
                  className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-200"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <Heatmap />
    </section>
  );
}
