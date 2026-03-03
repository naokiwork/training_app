import Link from "next/link";
import { PageTabs } from "@/components/PageTabs";
import { exercises as allExercises } from "@/data/exercises";

const categories = ["push", "pull", "legs", "core"];

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; category?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const search = params.search ?? "";
  const category = params.category ?? "";
  const normalizedSearch = search.trim().toLowerCase();

  const exercises = allExercises.filter((exercise) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      exercise.name.toLowerCase().includes(normalizedSearch) ||
      (exercise.purpose ?? "").toLowerCase().includes(normalizedSearch);
    const matchesCategory = !category || exercise.category === category;
    return matchesSearch && matchesCategory;
  });

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
      <h1 className="text-2xl font-bold">Exercise Guide</h1>
      <form method="GET" className="space-y-2 rounded border border-slate-800 p-3">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by exercise or purpose..."
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        />
        <div className="inline-flex flex-wrap rounded border border-slate-700 p-1">
          <button
            type="submit"
            name="category"
            value=""
            className={`rounded px-3 py-1 text-xs ${
              category === "" ? "bg-black text-white" : "text-slate-300"
            }`}
          >
            all
          </button>
          {categories.map((item) => (
            <button
              key={item}
              type="submit"
              name="category"
              value={item}
              className={`rounded px-3 py-1 text-xs ${
                category === item ? "bg-black text-white" : "text-slate-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </form>

      {exercises.length === 0 ? (
        <div className="rounded border border-slate-800 p-4 text-sm text-slate-400">
          No exercises match your current filters.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {exercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/exercises/${exercise.id}`}
              className="rounded border border-slate-800 p-3 hover:bg-slate-900"
            >
              <h2 className="font-semibold">{exercise.name}</h2>
              <p className="text-xs text-slate-400">{exercise.category ?? "uncategorized"}</p>
              <p className="mt-1 text-sm text-slate-300">{exercise.purpose ?? "No purpose yet."}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
