import Link from "next/link";
import { notFound } from "next/navigation";
import { MetadataRow } from "@/components/MetadataRow";
import { PageTabs } from "@/components/PageTabs";
import { SidebarInfo } from "@/components/SidebarInfo";
import { getCourseById } from "@/data/courses";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = getCourseById(id);
  if (!course) notFound();

  return (
    <section className="space-y-4">
      <PageTabs
        tabs={[
          { href: "/", label: "Dashboard" },
          { href: "/log", label: "Log" },
          { href: "/exercises", label: "Exercises" },
          { href: "/plans", label: "Plans" },
          { href: "/courses", label: "Courses" },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-slate-300">{course.summary}</p>
          <MetadataRow
            items={[
              { label: "Level", value: course.level },
              { label: "Split", value: course.weeklyStructure },
              { label: "Days/week", value: course.daysPerWeek },
            ]}
          />
          <div className="rounded border border-slate-800 p-4">
            <h2 className="mb-2 font-semibold">Progression Rule</h2>
            <p className="text-sm text-slate-300">{course.progressionRule}</p>
          </div>

          <div className="space-y-3">
            {course.days.map((day) => (
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
                      – {item.sets} sets × {item.repRange}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <SidebarInfo title="Execution Tip">
            Keep 1–2 reps in reserve for most sets unless the day is designed for max effort.
          </SidebarInfo>
          <SidebarInfo title="Guide Linking">
            Click any exercise name to open filtered exercise guidance.
          </SidebarInfo>
        </div>
      </div>
    </section>
  );
}
