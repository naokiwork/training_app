"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cacheExercises, getSessionDetail, upsertSessionWithDetails } from "@/lib/localdb/repo";

type Exercise = {
  id: string;
  name: string;
  category: string | null;
};

type SetRow = {
  reps: number;
  rpe: number | "";
  restSeconds: number;
  formQualityFlag: boolean;
};

type ExerciseBlock = {
  exerciseId: string;
  exerciseName: string;
  sets: SetRow[];
};

export function EditLogForm({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [painFlag, setPainFlag] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [blocks, setBlocks] = useState<ExerciseBlock[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      const detail = await getSessionDetail(sessionId);
      if (!detail) {
        setMissing(true);
        setLoaded(true);
        return;
      }
      setDate(detail.date);
      setPainFlag(detail.painFlag);
      setBlocks(
        detail.exercises.map((exerciseBlock) => ({
          exerciseId: exerciseBlock.exerciseId,
          exerciseName: exerciseBlock.exerciseName,
          sets: exerciseBlock.sets.map((set) => ({
            reps: set.reps,
            rpe: set.rpe ?? "",
            restSeconds: set.restSeconds ?? 90,
            formQualityFlag: set.formQualityFlag,
          })),
        }))
      );
      setLoaded(true);
    }
    void loadInitial();
  }, [sessionId]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadExercises() {
      const response = await fetch(
        `/api/exercises?search=${encodeURIComponent(exerciseSearch)}`,
        { signal: controller.signal }
      );
      if (!response.ok) return;
      const data = (await response.json()) as Exercise[];
      setExercises(data);
      await cacheExercises(data);
    }
    loadExercises();
    return () => controller.abort();
  }, [exerciseSearch]);

  const totalSets = useMemo(
    () => blocks.reduce((sum, block) => sum + block.sets.length, 0),
    [blocks]
  );

  function addExercise(exercise: Exercise) {
    setBlocks((prev) => {
      if (prev.some((block) => block.exerciseId === exercise.id)) return prev;
      return [
        ...prev,
        {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: [{ reps: 8, rpe: "", restSeconds: 90, formQualityFlag: false }],
        },
      ];
    });
  }

  function addSet(exerciseId: string) {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.exerciseId !== exerciseId) return block;
        const last = block.sets[block.sets.length - 1];
        return {
          ...block,
          sets: [
            ...block.sets,
            {
              reps: last.reps,
              rpe: last.rpe,
              restSeconds: last.restSeconds,
              formQualityFlag: false,
            },
          ],
        };
      })
    );
  }

  function removeSet(exerciseId: string, setIndex: number) {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.exerciseId !== exerciseId) return block;
        const nextSets = block.sets.filter((_, index) => index !== setIndex);
        if (nextSets.length === 0) return block;
        return { ...block, sets: nextSets };
      })
    );
  }

  function updateSet(
    exerciseId: string,
    setIndex: number,
    field: keyof SetRow,
    value: SetRow[keyof SetRow]
  ) {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.exerciseId !== exerciseId) return block;
        const sets = [...block.sets];
        sets[setIndex] = { ...sets[setIndex], [field]: value };
        return { ...block, sets };
      })
    );
  }

  async function saveLog() {
    setError("");
    if (blocks.length === 0 || totalSets === 0) {
      setError("At least one set is required.");
      return;
    }

    const payload = {
      id: sessionId,
      date,
      painFlag,
      exercises: blocks.map((block) => ({
        exerciseId: block.exerciseId,
        sets: block.sets.map((set) => ({
          reps: set.reps,
          rpe: set.rpe === "" ? undefined : Number(set.rpe),
          restSeconds: set.restSeconds,
          formQualityFlag: set.formQualityFlag,
        })),
      })),
    };

    setIsSaving(true);
    try {
      const result = await upsertSessionWithDetails(payload);
      setIsSaving(false);
      router.push(`/log?date=${result.date ?? date}`);
      router.refresh();
    } catch {
      setIsSaving(false);
      setError("Update failed.");
      return;
    }
  }

  if (!loaded) {
    return <section className="space-y-4">Loading local session...</section>;
  }

  if (missing) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-rose-400">Session not found on this device.</p>
        <button
          type="button"
          onClick={() => router.push("/log")}
          className="rounded border border-slate-700 px-3 py-1 text-sm"
        >
          Back to Log
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Edit Session</h1>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded border border-slate-700 bg-slate-900 px-3 py-1 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={painFlag}
            onChange={(event) => setPainFlag(event.target.checked)}
          />
          Pain flag
        </label>
      </div>

      <div className="rounded-lg border border-slate-800 p-3">
        <label className="mb-2 block text-sm text-slate-300">Add exercise</label>
        <input
          value={exerciseSearch}
          onChange={(event) => setExerciseSearch(event.target.value)}
          placeholder="Search exercises..."
          className="mb-3 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {exercises.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              onClick={() => addExercise(exercise)}
              className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
            >
              {exercise.name}
            </button>
          ))}
        </div>
      </div>

      {blocks.map((block) => (
        <article key={block.exerciseId} className="rounded-lg border border-slate-800 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{block.exerciseName}</h2>
            <button
              type="button"
              onClick={() => addSet(block.exerciseId)}
              className="rounded border border-slate-700 px-2 py-1 text-xs"
            >
              Add Set
            </button>
          </div>
          <div className="space-y-2">
            {block.sets.map((set, setIndex) => (
              <div key={`${block.exerciseId}-${setIndex}`} className="grid gap-2 md:grid-cols-7">
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={set.reps}
                  onChange={(event) =>
                    updateSet(block.exerciseId, setIndex, "reps", Number(event.target.value))
                  }
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  placeholder="RPE"
                  value={set.rpe}
                  onChange={(event) =>
                    updateSet(
                      block.exerciseId,
                      setIndex,
                      "rpe",
                      event.target.value === "" ? "" : Number(event.target.value)
                    )
                  }
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  max={3600}
                  placeholder="Rest sec"
                  value={set.restSeconds}
                  onChange={(event) =>
                    updateSet(
                      block.exerciseId,
                      setIndex,
                      "restSeconds",
                      Number(event.target.value)
                    )
                  }
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
                />
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={set.formQualityFlag}
                    onChange={(event) =>
                      updateSet(
                        block.exerciseId,
                        setIndex,
                        "formQualityFlag",
                        event.target.checked
                      )
                    }
                  />
                  Form issue
                </label>
                <button
                  type="button"
                  onClick={() => removeSet(block.exerciseId, setIndex)}
                  className="rounded border border-rose-800 px-2 py-1 text-xs text-rose-300"
                >
                  Delete Set
                </button>
              </div>
            ))}
          </div>
        </article>
      ))}

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <button
        type="button"
        onClick={saveLog}
        disabled={isSaving}
        className="rounded bg-emerald-600 px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Update Session"}
      </button>
    </section>
  );
}
