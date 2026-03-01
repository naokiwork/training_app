import Link from "next/link";
import { MetadataRow } from "@/components/MetadataRow";
import { PageTabs } from "@/components/PageTabs";
import { SidebarInfo } from "@/components/SidebarInfo";
import { StatusBadge } from "@/components/StatusBadge";
import { getUserIdFromCookieStore } from "@/lib/auth";
import { isPremium } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";
import { SessionActions } from "./SessionActions";

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function relativeTime(value: Date) {
  const seconds = Math.floor((Date.now() - value.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export default async function LogPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const selectedDate = params.date ?? todayDateString();
  const userId = await getUserIdFromCookieStore();
  const premium = userId ? await isPremium(userId) : false;

  const sessions = await prisma.workoutSession.findMany({
    where: { date: selectedDate, userId },
    orderBy: { createdAt: "desc" },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: {
            orderBy: { setOrder: "asc" },
          },
        },
        orderBy: { exerciseOrder: "asc" },
      },
    },
  });

  const summary = sessions.reduce(
    (acc, session) => {
      acc.sessions += 1;
      for (const exercise of session.exercises) {
        acc.exercises += 1;
        acc.sets += exercise.sets.length;
        for (const set of exercise.sets) {
          acc.reps += set.reps;
        }
      }
      return acc;
    },
    { sessions: 0, exercises: 0, sets: 0, reps: 0 }
  );

  return (
    <section className="space-y-4">
      <PageTabs
        tabs={[
          { href: "/", label: "Dashboard" },
          { href: "/log", label: "Log" },
          { href: "/exercises", label: "Exercises" },
          { href: "/plans", label: "Plans" },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Workout Log</h1>
          <p className="text-sm text-slate-400">Review and track your daily training history.</p>
        </div>
        <Link href="/log/new" className="rounded bg-emerald-600 px-3 py-2 text-sm text-white">
          New Session
        </Link>
      </div>
      {!premium ? (
        <p className="rounded border border-amber-700/60 bg-amber-950/30 p-3 text-xs text-amber-300">
          Free plan: history access may be limited. Upgrade at <a className="underline" href="/pricing">/pricing</a>.
        </p>
      ) : null}

      <form method="GET" className="flex items-center gap-2">
        <label className="text-sm text-slate-300" htmlFor="date">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          defaultValue={selectedDate}
          className="rounded border border-slate-700 bg-slate-900 px-3 py-1 text-sm"
        />
        <button type="submit" className="rounded border border-slate-700 px-3 py-1 text-sm">
          Apply
        </button>
      </form>

      <MetadataRow
        items={[
          { label: "Date", value: selectedDate },
          { label: "Sessions", value: summary.sessions },
          { label: "Exercises", value: summary.exercises },
          { label: "Sets", value: summary.sets },
          { label: "Reps", value: summary.reps },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="rounded-lg border border-slate-800 p-4 text-slate-300">
              No sessions found for this date.
            </div>
          ) : (
            sessions.map((session) => (
              <article key={session.id} className="rounded-lg border border-slate-800 p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold">Session {session.id.slice(-6)}</h2>
                    <p className="text-xs text-slate-400">{relativeTime(session.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge
                      status={session.painFlag ? "warning" : "success"}
                      label={session.painFlag ? "Pain Flag" : "Normal"}
                    />
                    <SessionActions sessionId={session.id} date={selectedDate} />
                  </div>
                </div>

                <div className="space-y-3">
                  {session.exercises.map((exerciseBlock) => (
                    <div key={exerciseBlock.id} className="rounded border border-slate-800 p-3">
                      <h3 className="font-medium">{exerciseBlock.exercise.name}</h3>
                      <p className="mb-2 text-xs text-slate-400">
                        Category: {exerciseBlock.exercise.category ?? "uncategorized"}
                      </p>
                      <table className="w-full text-left text-xs">
                        <thead className="text-slate-400">
                          <tr>
                            <th className="py-1">Set</th>
                            <th className="py-1">Reps</th>
                            <th className="py-1">RPE</th>
                            <th className="py-1">Rest</th>
                            <th className="py-1">Form</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exerciseBlock.sets.map((set) => (
                            <tr key={set.id} className="border-t border-slate-800 text-slate-300">
                              <td className="py-1">{set.setOrder + 1}</td>
                              <td className="py-1">{set.reps}</td>
                              <td className="py-1">{set.rpe ?? "-"}</td>
                              <td className="py-1">{set.restSeconds ?? "-"}</td>
                              <td className="py-1">{set.formQualityFlag ? "Needs Review" : "OK"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>

        <div className="space-y-3">
          <SidebarInfo title="How to Use">
            Use the date filter to inspect one day at a time. Create a new session from the top-right
            button.
          </SidebarInfo>
          <SidebarInfo title="Quick Tips">
            Keep rest and RPE fields consistent to improve trend analysis in upcoming dashboard widgets.
          </SidebarInfo>
        </div>
      </div>
    </section>
  );
}
