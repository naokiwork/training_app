"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        level: "error",
        message: "global_error_boundary",
        digest: error.digest ?? null,
      })
    );
  }, [error]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="space-y-3 rounded border border-rose-800 p-4">
        <h2 className="text-lg font-semibold text-rose-300">Something went wrong</h2>
        <p className="text-sm text-rose-400">An unexpected error occurred.</p>
        <button
          type="button"
          onClick={reset}
          className="rounded border border-rose-700 px-3 py-1 text-sm text-rose-300"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
