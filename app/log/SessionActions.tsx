"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteSession } from "@/lib/localdb/repo";

export function SessionActions({
  sessionId,
  date,
  onDeleted,
}: {
  sessionId: string;
  date: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!confirm("Delete this session?")) return;
    setDeleting(true);
    setError("");
    try {
      await deleteSession(sessionId);
    } catch {
      setError("Delete failed.");
      setDeleting(false);
      return;
    }
    router.push(`/log?date=${date}`);
    onDeleted?.();
    setDeleting(false);
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
