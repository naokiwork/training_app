import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";
import { AuthStatus } from "@/components/AuthStatus";

export const metadata: Metadata = {
  title: "Calisthenics Training App",
  description: "Workout log, exercise guide, and plans",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-800 bg-slate-950">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-sm font-semibold text-slate-100">
              Training App
            </Link>
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <Link href="/log">Log</Link>
              <Link href="/exercises">Exercises</Link>
              <Link href="/plans">Plans</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/account/billing">Billing</Link>
              <Link href="/sync">Sync</Link>
              <Link
                href="/log/new"
                className="rounded bg-emerald-600 px-3 py-1 font-medium text-white"
              >
                New Log
              </Link>
            </div>
          </nav>
          <div className="mx-auto max-w-5xl px-4 pb-2">
            <AuthStatus />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
