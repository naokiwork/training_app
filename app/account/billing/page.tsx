"use client";

import { useState } from "react";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/billing/portal", { method: "POST" });
    const body = (await response.json()) as { url?: string; error?: string };
    setLoading(false);
    if (!response.ok || !body.url) {
      setError(body.error ?? "Could not open billing portal.");
      return;
    }
    window.location.href = body.url;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Billing</h1>
      <p className="text-slate-300">Manage subscription, payment method, and cancellation.</p>
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className="rounded border border-slate-700 px-4 py-2 text-sm disabled:opacity-50"
      >
        {loading ? "Opening..." : "Open Billing Portal"}
      </button>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </section>
  );
}
