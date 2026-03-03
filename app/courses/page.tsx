import Link from "next/link";
import { PageTabs } from "@/components/PageTabs";
import { StatusBadge } from "@/components/StatusBadge";
import { courses } from "@/data/courses";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
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
      <h1 className="text-2xl font-bold">Training Courses</h1>
      <p className="text-sm text-slate-400">
        Structured programs with day-by-day templates. Click any course to view details.
      </p>
      {courses.length === 0 ? (
        <div className="rounded border border-slate-800 p-4 text-sm text-slate-400">
          No courses available.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="rounded border border-slate-800 p-4 hover:bg-slate-900"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">{course.title}</h2>
                <StatusBadge status="info" label={course.level} />
              </div>
              <p className="mb-2 text-sm text-slate-300">{course.summary}</p>
              <p className="text-xs text-slate-400">
                Structure: {course.weeklyStructure} · {course.daysPerWeek} days/week
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
