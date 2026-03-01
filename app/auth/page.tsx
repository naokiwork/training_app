"use client";

import { useEffect, useState } from "react";

type MeResponse = {
  user: { id: string; email: string } | null;
};

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  async function refreshMe() {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    const body = (await response.json()) as MeResponse;
    setCurrentUser(body.user?.email ?? null);
  }

  useEffect(() => {
    refreshMe();
  }, []);

  async function register() {
    setMessage("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(body.error ?? "Register failed.");
      return;
    }
    setMessage("Registered. Please sign in.");
  }

  async function login() {
    setMessage("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(body.error ?? "Login failed.");
      return;
    }
    setMessage("Signed in.");
    refreshMe();
  }

  async function logout() {
    setMessage("");
    await fetch("/api/auth/logout", { method: "POST" });
    setMessage("Signed out.");
    refreshMe();
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Account</h1>
      <p className="text-sm text-slate-400">
        Current: {currentUser ? `Signed in as ${currentUser}` : "Guest mode"}
      </p>

      <div className="max-w-md space-y-3 rounded border border-slate-800 p-4">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password (min 8 chars)"
          type="password"
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={register}
            className="rounded border border-slate-700 px-3 py-1 text-sm"
          >
            Register
          </button>
          <button type="button" onClick={login} className="rounded bg-emerald-600 px-3 py-1 text-sm">
            Login
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded border border-rose-800 px-3 py-1 text-sm text-rose-300"
          >
            Logout
          </button>
        </div>
      </div>

      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </section>
  );
}
