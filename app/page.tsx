import { Heatmap } from "@/components/Heatmap";
import { MetadataRow } from "@/components/MetadataRow";
import { PageTabs } from "@/components/PageTabs";
import { getUserIdFromCookieStore } from "@/lib/auth";
import { isPremium } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const userId = await getUserIdFromCookieStore();
  const premium = userId ? await isPremium(userId) : false;

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
      <h1 className="text-3xl font-bold">Calisthenics Dashboard</h1>
      <p className="text-slate-300">
        Start with a new log, then add exercises and training plans.
      </p>
      {!premium ? (
        <p className="rounded border border-amber-700/60 bg-amber-950/30 p-3 text-xs text-amber-300">
          Free plan active (recent history only). Upgrade at <a className="underline" href="/pricing">/pricing</a>.
        </p>
      ) : null}
      <MetadataRow
        items={[
          { label: "Focus", value: "Consistency" },
          { label: "Plan", value: premium ? "Premium" : "Free" },
        ]}
      />
      <Heatmap />
    </section>
  );
}
