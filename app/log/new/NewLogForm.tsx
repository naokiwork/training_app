"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cacheExercises, upsertSessionWithDetails } from "@/lib/localdb/repo";

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

function today() {
  return new Date().toISOString().slice(0, 10);
}

function createDefaultSet(previous?: SetRow): SetRow {
  if (previous) {
    return {
      reps: previous.reps,
      rpe: previous.rpe,
      restSeconds: previous.restSeconds,
      formQualityFlag: false,
    };
  }
  return { reps: 8, rpe: "", restSeconds: 90, formQualityFlag: false };
}

export function NewLogForm() {
  const router = useRouter();
  const [date, setDate] = useState(today());
  const [painFlag, setPainFlag] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [blocks, setBlocks] = useState<ExerciseBlock[]>([]);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [restTimerLabel, setRestTimerLabel] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadExercises() {
      try {
        setLoadError("");
        const response = await fetch("/api/exercises", { signal: controller.signal });
        if (!response.ok) {
          setLoadError("Failed to load exercises.");
          return;
        }
        const data = (await response.json()) as Exercise[];
        setExercises(data);
        await cacheExercises(data);
      } catch {
        setLoadError("Failed to load exercises.");
      }
    }
    loadExercises();
    return () => controller.abort();
  }, []);

  const totalSets = useMemo(
    () => blocks.reduce((sum, block) => sum + block.sets.length, 0),
    [blocks]
  );

  function addExercise(exercise: Exercise) {
    setBlocks((prev) => {
      if (prev.some((block) => block.exerciseId === exercise.id)) return prev;
      return [
        ...prev,
        { exerciseId: exercise.id, exerciseName: exercise.name, sets: [createDefaultSet()] },
      ];
    });
  }

  function addSet(exerciseId: string) {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.exerciseId !== exerciseId) return block;
        const lastSet = block.sets[block.sets.length - 1];
        return { ...block, sets: [...block.sets, createDefaultSet(lastSet)] };
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

  function nudgeReps(exerciseId: string, setIndex: number, delta: number) {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.exerciseId !== exerciseId) return block;
        const sets = [...block.sets];
        const next = Math.max(0, Math.min(500, sets[setIndex].reps + delta));
        sets[setIndex] = { ...sets[setIndex], reps: next };
        return { ...block, sets };
      })
    );
  }

  function startRestTimer(seconds: number, label: string) {
    setRestTimerSeconds(seconds);
    setRestTimerLabel(label);
  }

  useEffect(() => {
    if (restTimerSeconds === null) return;
    if (restTimerSeconds <= 0) return;
    const timer = setTimeout(() => {
      setRestTimerSeconds((prev) => (prev === null ? prev : prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [restTimerSeconds]);

  async function saveLog() {
    setError("");
    if (blocks.length === 0 || totalSets === 0) {
      setError("Add at least one exercise and one set.");
      return;
    }

    for (const block of blocks) {
      for (const set of block.sets) {
        if (set.rpe !== "" && (set.rpe < 0 || set.rpe > 10)) {
          setError("RPE must be between 0 and 10.");
          return;
        }
        if (set.restSeconds < 0 || set.restSeconds > 3600) {
          setError("Rest seconds must be between 0 and 3600.");
          return;
        }
      }
    }

    setIsSaving(true);
    const payload = {
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

    try {
      const result = await upsertSessionWithDetails(payload);
      setIsSaving(false);
      router.push(`/log?date=${result.date ?? date}`);
    } catch {
      setIsSaving(false);
      setError("Could not save session.");
      return;
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">New Session</h1>
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
        {restTimerSeconds !== null ? (
          <div className="rounded border border-slate-700 px-2 py-1 text-sm text-slate-200">
            Rest Timer ({restTimerLabel}):{" "}
            {restTimerSeconds > 0 ? `${restTimerSeconds}s` : "Done"}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-slate-800 p-3">
        <label className="mb-2 block text-sm text-slate-300">Exercise picker</label>
        <div className="grid gap-2 max-h-48 overflow-y-auto md:grid-cols-3">
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
        {loadError ? <p className="mt-2 text-xs text-rose-400">{loadError}</p> : null}
        {!loadError && exercises.length === 0 ? (
          <p className="mt-2 text-xs text-slate-400">No exercises found.</p>
        ) : null}
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
              <div key={`${block.exerciseId}-${setIndex}`} className="grid gap-2 md:grid-cols-6">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => nudgeReps(block.exerciseId, setIndex, -1)}
                    className="rounded border border-slate-700 px-2"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={set.reps}
                    onChange={(event) =>
                      updateSet(block.exerciseId, setIndex, "reps", Number(event.target.value))
                    }
                    className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => nudgeReps(block.exerciseId, setIndex, 1)}
                    className="rounded border border-slate-700 px-2"
                  >
                    +
                  </button>
                </div>
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
                  onClick={() =>
                    startRestTimer(set.restSeconds, `${block.exerciseName} set ${setIndex + 1}`)
                  }
                  className="rounded border border-sky-800 px-2 py-1 text-xs text-sky-300"
                >
                  Complete Set / Start Rest
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
        {isSaving ? "Saving..." : "Save Session"}
      </button>
    </section>
  );
}
