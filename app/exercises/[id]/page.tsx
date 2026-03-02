import { notFound } from "next/navigation";
import { SidebarInfo } from "@/components/SidebarInfo";
import { getPrisma } from "@/lib/prisma";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exercise = await getPrisma().exercise.findUnique({ where: { id } });
  if (!exercise) notFound();

  return (
    <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{exercise.name}</h1>
          <p className="text-sm text-slate-400">Category: {exercise.category ?? "uncategorized"}</p>
        </div>

        <article className="rounded border border-slate-800 p-4">
          <h2 className="mb-1 font-semibold">Purpose</h2>
          <p className="text-sm text-slate-300">{exercise.purpose ?? "Not set yet."}</p>
        </article>

        <article className="rounded border border-slate-800 p-4">
          <h2 className="mb-1 font-semibold">Form Cues</h2>
          <p className="text-sm text-slate-300">{exercise.formCues ?? "Not set yet."}</p>
        </article>

        <article className="rounded border border-slate-800 p-4">
          <h2 className="mb-1 font-semibold">Common Mistakes</h2>
          <p className="text-sm text-slate-300">{exercise.mistakes ?? "Not set yet."}</p>
        </article>

        <article className="rounded border border-slate-800 p-4">
          <h2 className="mb-1 font-semibold">Safety Notes</h2>
          <p className="text-sm text-slate-300">{exercise.safetyNotes ?? "Not set yet."}</p>
        </article>

        <article className="rounded border border-slate-800 p-4">
          <h2 className="mb-1 font-semibold">Regression / Progression</h2>
          <p className="text-sm text-slate-300">
            <span className="font-medium">Regression:</span> {exercise.regression ?? "Not set yet."}
          </p>
          <p className="mt-1 text-sm text-slate-300">
            <span className="font-medium">Progression:</span> {exercise.progression ?? "Not set yet."}
          </p>
        </article>
      </div>

      <div className="space-y-3">
        <SidebarInfo title="Guide Tips">
          Focus on clean reps first. If quality drops, move to an easier regression.
        </SidebarInfo>
        <SidebarInfo title="Log Integration">
          You can select this exercise from the new log form and track RPE/rest/set quality.
        </SidebarInfo>
      </div>
    </section>
  );
}
