"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SessionActions({
  sessionId,
  date,
}: {
  sessionId: string;
  date: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!confirm("Delete this session?")) return;
    setDeleting(true);
    setError("");
    const response = await fetch(`/api/logs/${sessionId}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Delete failed.");
      setDeleting(false);
      return;
    }
    router.push(`/log?date=${date}`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/log/${sessionId}/edit`}
        className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-200"
      >
        Edit
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded border border-rose-800 px-2 py-1 text-xs text-rose-300 disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
      {error ? <span className="text-xs text-rose-400">{error}</span> : null}
    </div>
  );
}
