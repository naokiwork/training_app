import Link from "next/link";
import { notFound } from "next/navigation";
import { MetadataRow } from "@/components/MetadataRow";
import { SidebarInfo } from "@/components/SidebarInfo";
import { getPlanById } from "@/data/plans";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = getPlanById(id);
  if (!plan) notFound();

  return (
    <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{plan.title}</h1>
        <p className="text-slate-300">{plan.summary}</p>
        <MetadataRow
          items={[
            { label: "Level", value: plan.level },
            { label: "Split", value: plan.weeklyStructure },
          ]}
        />
        <div className="rounded border border-slate-800 p-4">
          <h2 className="mb-2 font-semibold">Progression Rule</h2>
          <p className="text-sm text-slate-300">{plan.progressionRule}</p>
        </div>

        <div className="space-y-3">
          {plan.days.map((day) => (
            <article key={day.day} className="rounded border border-slate-800 p-4">
              <h3 className="font-semibold">{day.day}</h3>
              <p className="mb-2 text-xs text-slate-400">{day.focus}</p>
              <ul className="space-y-1 text-sm">
                {day.items.map((item) => (
                  <li key={`${day.day}-${item.exerciseName}`} className="text-slate-300">
                    <Link
                      href={`/exercises?search=${encodeURIComponent(item.exerciseName)}`}
                      className="underline decoration-slate-600 underline-offset-2"
                    >
                      {item.exerciseName}
                    </Link>{" "}
                    - {item.sets} sets - {item.repRange}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SidebarInfo title="Execution Tip">
          Keep 1-2 reps in reserve for most sets unless the day is designed for max effort.
        </SidebarInfo>
        <SidebarInfo title="Guide Linking">
          Click any exercise name to open filtered exercise guidance.
        </SidebarInfo>
      </div>
    </section>
  );
}
