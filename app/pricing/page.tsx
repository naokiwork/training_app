"use client";

import { useState } from "react";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/billing/checkout", { method: "POST" });
    const body = (await response.json()) as { url?: string; error?: string };
    setLoading(false);
    if (!response.ok || !body.url) {
      setError(body.error ?? "Could not start checkout.");
      return;
    }
    window.location.href = body.url;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Premium</h1>
      <p className="text-slate-300">First month free trial. From month 2, JPY 100/month.</p>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="rounded bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Opening checkout..." : "Start Free Trial"}
      </button>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </section>
  );
}
