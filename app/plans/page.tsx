import Link from "next/link";
import { PageTabs } from "@/components/PageTabs";
import { StatusBadge } from "@/components/StatusBadge";
import { getUserIdFromCookieStore } from "@/lib/auth";
import { isPremium } from "@/lib/entitlements";
import { plans } from "@/data/plans";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const userId = await getUserIdFromCookieStore();
  const premium = userId ? await isPremium(userId) : false;
  const visiblePlans = premium ? plans : plans.slice(0, 1);

  return (
    <section className="space-y-4">
      <PageTabs
        tabs={[
          { href: "/", label: "Dashboard" },
          { href: "/log", label: "Log" },
          { href: "/exercises", label: "Exercises" },
          { href: "/plans", label: "Plans" },
        ]}
      />
      <h1 className="text-2xl font-bold">Workout Plans</h1>
      {!premium ? (
        <p className="rounded border border-amber-700/60 bg-amber-950/30 p-3 text-xs text-amber-300">
          Free plan shows only starter plan. Upgrade at <a className="underline" href="/pricing">/pricing</a>.
        </p>
      ) : null}
      {visiblePlans.length === 0 ? (
        <div className="rounded border border-slate-800 p-4 text-sm text-slate-400">
          No plans available.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visiblePlans.map((plan) => (
            <Link
              key={plan.id}
              href={`/plans/${plan.id}`}
              className="rounded border border-slate-800 p-4 hover:bg-slate-900"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">{plan.title}</h2>
                <StatusBadge status="info" label={plan.level} />
              </div>
              <p className="mb-2 text-sm text-slate-300">{plan.summary}</p>
              <p className="text-xs text-slate-400">Structure: {plan.weeklyStructure}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
