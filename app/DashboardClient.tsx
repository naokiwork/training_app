"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heatmap } from "@/components/Heatmap";
import { MetadataRow } from "@/components/MetadataRow";
import { PageTabs } from "@/components/PageTabs";
import { getDashboardStats } from "@/lib/localdb/repo";

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

  useEffect(() => {
    async function load() {
      const next = await getDashboardStats();
      setStats(next);
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

      <Heatmap />
    </section>
  );
}
