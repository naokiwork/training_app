"use client";

import { useState } from "react";
import { exportLocalBackup, importLocalBackup } from "@/storage/indexeddb";

function downloadTextFile(name: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SettingsPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const payload = await exportLocalBackup();
      const fileName = `training-backup-${new Date().toISOString().slice(0, 10)}.json`;
      downloadTextFile(fileName, JSON.stringify(payload, null, 2));
      setMessage("Backup exported.");
    } catch {
      setError("Export failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport(file: File) {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      await importLocalBackup(parsed);
      setMessage("Backup imported.");
    } catch {
      setError("Import failed. Check file format/schemaVersion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-slate-400">Export or import your local IndexedDB data.</p>
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        Export Backup (JSON)
      </button>
      <div className="rounded border border-slate-800 p-3">
        <label className="mb-2 block text-sm text-slate-300" htmlFor="import-file">
          Import Backup (overwrites current local data)
        </label>
        <input
          id="import-file"
          type="file"
          accept="application/json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void handleImport(file);
            event.currentTarget.value = "";
          }}
          className="block w-full text-sm text-slate-300"
        />
      </div>
      {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </section>
  );
}
