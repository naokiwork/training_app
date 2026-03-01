"use client";

import { useState } from "react";

type PushResponse = {
  error?: string;
  snapshotId?: string;
  version?: number;
  checksum?: string;
  createdAt?: string;
  sessionCount?: number;
};

type PullResponse = {
  error?: string;
  snapshot?: {
    id: string;
    version: number;
    checksum: string;
    createdAt: string;
    payload: unknown[];
  } | null;
};

type ApplyResponse = {
  error?: string;
  snapshotId?: string;
  version?: number;
  restoredSessions?: number;
};

export default function SyncPage() {
  const [message, setMessage] = useState("");
  const [snapshotInfo, setSnapshotInfo] = useState<string>("");
  const [confirmedOverwrite, setConfirmedOverwrite] = useState(false);

  async function pushSync() {
    setMessage("");
    const response = await fetch("/api/sync/push", { method: "POST" });
    const body = (await response.json()) as PushResponse;
    if (!response.ok) {
      setMessage(body.error ?? "Push failed.");
      return;
    }
    setSnapshotInfo(
      `snapshot=${body.snapshotId} version=${body.version} checksum=${body.checksum} sessions=${body.sessionCount}`
    );
    setMessage("Push completed.");
  }

  async function pullSync() {
    setMessage("");
    const response = await fetch("/api/sync/pull");
    const body = (await response.json()) as PullResponse;
    if (!response.ok) {
      setMessage(body.error ?? "Pull failed.");
      return;
    }
    if (!body.snapshot) {
      setSnapshotInfo("No snapshot found.");
      setMessage("Pull completed.");
      return;
    }
    setSnapshotInfo(
      `snapshot=${body.snapshot.id} version=${body.snapshot.version} checksum=${body.snapshot.checksum} createdAt=${body.snapshot.createdAt} items=${body.snapshot.payload.length}`
    );
    setMessage("Pull completed.");
  }

  async function applySnapshot() {
    setMessage("");
    if (!confirmedOverwrite) {
      setMessage("Please confirm overwrite before Apply Snapshot.");
      return;
    }
    const response = await fetch("/api/sync/apply", { method: "POST" });
    const body = (await response.json()) as ApplyResponse;
    if (!response.ok) {
      setMessage(body.error ?? "Apply failed.");
      return;
    }
    setSnapshotInfo(
      `applied snapshot=${body.snapshotId} version=${body.version} restoredSessions=${body.restoredSessions}`
    );
    setMessage("Apply completed.");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Cloud Sync</h1>
      <p className="text-sm text-slate-400">
        Sign in first, then push local data to a cloud snapshot or pull latest snapshot metadata.
      </p>
      <p className="text-xs text-amber-400">
        Apply Snapshot overwrites your current local workout data.
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={pushSync} className="rounded bg-indigo-600 px-3 py-1 text-sm">
          Push Sync
        </button>
        <button
          type="button"
          onClick={pullSync}
          className="rounded border border-slate-700 px-3 py-1 text-sm"
        >
          Pull Sync
        </button>
        <button
          type="button"
          onClick={applySnapshot}
          className="rounded border border-emerald-700 px-3 py-1 text-sm text-emerald-300"
        >
          Apply Snapshot
        </button>
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-400">
        <input
          type="checkbox"
          checked={confirmedOverwrite}
          onChange={(event) => setConfirmedOverwrite(event.target.checked)}
        />
        I understand this will overwrite current local logs.
      </label>

      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
      {snapshotInfo ? <p className="text-xs text-slate-400">{snapshotInfo}</p> : null}
    </section>
  );
}
