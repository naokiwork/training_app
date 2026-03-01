"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MeResponse = {
  user: { id: string; email: string } | null;
};

export function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) return;
      const body = (await response.json()) as MeResponse;
      setEmail(body.user?.email ?? null);
    }
    load();
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      {email ? <span>Signed in: {email}</span> : <span>Guest</span>}
      <Link href="/auth" className="underline underline-offset-2">
        Account
      </Link>
    </div>
  );
}
