"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MetadataRow } from "@/components/MetadataRow";
import { PageTabs } from "@/components/PageTabs";
import { SidebarInfo } from "@/components/SidebarInfo";
import { StatusBadge } from "@/components/StatusBadge";
import { listSessionDetailsByDate, repeatLastSession, saveQuickSession } from "@/lib/localdb/repo";
import type { LocalSessionDetail } from "@/lib/localdb/types";
import { SessionActions } from "./SessionActions";

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function relativeTime(createdAtMs: number) {
  const seconds = Math.floor((Date.now() - createdAtMs) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

function getFreeWindowStart() {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return date.toISOString().slice(0, 10);
}

export function LogPageClient({
  initialDate,
  premium,
}: {
  initialDate: string;
  premium: boolean;
}) {
  const [selectedDate, setSelectedDate] = useState(initialDate || todayDateString());
  const [sessions, setSessions] = useState<LocalSessionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quickSaving, setQuickSaving] = useState(false);

  const canReadDate = premium || selectedDate >= getFreeWindowStart();

  async function reloadSessions(date: string) {
    setLoading(true);
    setError("");
    try {
      if (!canReadDate) {
        setSessions([]);
        return;
      }
      const rows = await listSessionDetailsByDate(date);
      setSessions(rows);
    } catch {
      setError("Failed to load local logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reloadSessions(selectedDate);
  }, [selectedDate, premium]);

  const summary = useMemo(
    () =>
      sessions.reduce(
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
      ),
    [sessions]
  );

  async function handleQuickLog(exerciseId: string, reps: number) {
    setQuickSaving(true);
    setError("");
    try {
      await saveQuickSession(exerciseId, reps, selectedDate);
      await reloadSessions(selectedDate);
    } catch {
      setError("Quick log failed.");
    } finally {
      setQuickSaving(false);
    }
  }

  async function handleRepeatLast() {
    setQuickSaving(true);
    setError("");
    try {
      const result = await repeatLastSession(selectedDate);
      if (!result) {
        setError("No previous log to repeat.");
      } else {
        await reloadSessions(selectedDate);
      }
    } catch {
      setError("Repeat last log failed.");
    } finally {
      setQuickSaving(false);
    }
  }

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
          <p className="text-sm text-slate-400">Review and track your local training history.</p>
        </div>
        <Link href="/log/new" className="rounded bg-emerald-600 px-3 py-2 text-sm text-white">
          New Session
        </Link>
      </div>

      {!premium ? (
        <p className="rounded border border-amber-700/60 bg-amber-950/30 p-3 text-xs text-amber-300">
          Free plan: last 30 days only (local-first mode).
        </p>
      ) : null}

      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void reloadSessions(selectedDate);
        }}
      >
        <label className="text-sm text-slate-300" htmlFor="date">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
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
          {!canReadDate ? (
            <div className="rounded-lg border border-amber-700/60 bg-amber-950/30 p-4 text-amber-300">
              Free plan allows only recent 30-day history.
            </div>
          ) : null}
          {loading ? (
            <div className="rounded-lg border border-slate-800 p-4 text-slate-300">Loading local sessions...</div>
          ) : null}
          {error ? <div className="rounded-lg border border-rose-800 p-4 text-rose-300">{error}</div> : null}
          {!loading && !error && canReadDate && sessions.length === 0 ? (
            <div className="space-y-3 rounded-lg border border-slate-800 p-4 text-slate-300">
              <p className="font-medium">Start by logging your first workout</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={quickSaving}
                  onClick={() => void handleQuickLog("push-up", 10)}
                  className="rounded bg-black px-3 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  Push-up 10 reps
                </button>
                <button
                  type="button"
                  disabled={quickSaving}
                  onClick={() => void handleQuickLog("bodyweight-squat", 15)}
                  className="rounded bg-black px-3 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  Squat 15 reps
                </button>
                <button
                  type="button"
                  disabled={quickSaving}
                  onClick={() => void handleQuickLog("pull-up", 5)}
                  className="rounded bg-black px-3 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  Pull-up 5 reps
                </button>
                <button
                  type="button"
                  disabled={quickSaving}
                  onClick={() => void handleRepeatLast()}
                  className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-200 disabled:opacity-50"
                >
                  Repeat Last Log
                </button>
              </div>
              <ol className="space-y-1 text-xs text-slate-400">
                <li>1. Tap a quick button to save instantly.</li>
                <li>2. Review details in today&apos;s log list.</li>
                <li>3. Use Edit later when you want fine control.</li>
              </ol>
            </div>
          ) : null}
          {!loading && !error && canReadDate
            ? sessions.map((session) => (
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
                      <SessionActions
                        sessionId={session.id}
                        date={selectedDate}
                        onDeleted={() => void reloadSessions(selectedDate)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {session.exercises.map((exerciseBlock) => (
                      <div key={exerciseBlock.id} className="rounded border border-slate-800 p-3">
                        <h3 className="font-medium">{exerciseBlock.exerciseName}</h3>
                        <p className="mb-2 text-xs text-slate-400">
                          Category: {exerciseBlock.category ?? "uncategorized"}
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
            : null}
        </div>

        <div className="space-y-3">
          <SidebarInfo title="How to Use">
            Logs are stored on this device (IndexedDB). Use the date filter to inspect one day at a time.
          </SidebarInfo>
          <SidebarInfo title="Quick Tips">
            Keep rest and RPE fields consistent to improve local trend analysis.
          </SidebarInfo>
        </div>
      </div>
    </section>
  );
}
