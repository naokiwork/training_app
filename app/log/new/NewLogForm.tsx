"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { exercises as seedExercises } from "@/data/exercises";
import { courses } from "@/data/courses";
import {
  cacheExercises,
  getLastSetDraft,
  listCachedExercises,
  listRecentSetDrafts,
  repeatLastSession,
  saveLastSetDraft,
  saveQuickSession,
  upsertSessionWithDetails,
  getCourseDayExercises,
} from "@/lib/localdb/repo";

type Exercise = {
  id: string;
  name: string;
  category?: string | null;
};

type SetRow = {
  reps: number;
  weightKg: number | "";
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
      weightKg: previous.weightKg,
      rpe: previous.rpe,
      restSeconds: previous.restSeconds,
      formQualityFlag: false,
    };
  }
  return { reps: 8, weightKg: "", rpe: "", restSeconds: 90, formQualityFlag: false };
}

export function NewLogForm() {
  const router = useRouter();
  const [date, setDate] = useState(today());
  const [painFlag, setPainFlag] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [blocks, setBlocks] = useState<ExerciseBlock[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | "">("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState("");
  const [draftExerciseId, setDraftExerciseId] = useState("");
  const [draftReps, setDraftReps] = useState(8);
  const [draftWeightKg, setDraftWeightKg] = useState<number | "">("");
  const [draftRecentSets, setDraftRecentSets] = useState<
    Array<{
      exerciseId: string;
      exerciseName?: string;
      reps: number;
      weightKg?: number;
      restSeconds?: number;
      rpe?: number;
      formQualityFlag?: boolean;
      updatedAt: number;
    }>
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [restTimerLabel, setRestTimerLabel] = useState("");

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoadError("");
        const cached = await listCachedExercises();
        if (cached.length > 0) {
          setExercises(cached);
        } else {
          const fallback = seedExercises.map((exercise) => ({
            id: exercise.id,
            name: exercise.name,
            category: exercise.category,
          }));
          await cacheExercises(fallback);
          setExercises(fallback);
        }
        const [lastDraft, recent] = await Promise.all([getLastSetDraft(), listRecentSetDrafts(3)]);
        if (lastDraft) {
          setDraftExerciseId(lastDraft.exerciseId);
          setDraftReps(lastDraft.reps);
          setDraftWeightKg(typeof lastDraft.weightKg === "number" ? lastDraft.weightKg : "");
        }
          setDraftRecentSets(recent);
        } catch {
          setLoadError("Failed to load exercises.");
        }
      }
    void loadInitial();
  }, []);

  useEffect(() => {
    if (selectedCourseId && typeof selectedDayIndex === "number") {
      void (async () => {
        const courseDayExercises = await getCourseDayExercises(selectedCourseId, selectedDayIndex);
        setBlocks(courseDayExercises.map(item => ({
          exerciseId: item.exerciseId,
          exerciseName: item.exerciseName,
          sets: Array(item.sets).fill(createDefaultSet())
        })));
      })();
    } else {
      setBlocks([]);
    }
  }, [selectedCourseId, selectedDayIndex]);

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

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  const selectedDraftExercise = useMemo(
    () => exercises.find((item) => item.id === draftExerciseId) ?? null,
    [draftExerciseId, exercises]
  );

  async function handleQuickLog(exerciseName: string, reps: number) {
    const exercise = exercises.find((item) => item.name === exerciseName);
    if (!exercise) {
      setError(`${exerciseName} is not available.`);
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await saveQuickSession(exercise.id, reps, date);
      setToast(`Saved quick log: ${exerciseName} ${reps} reps`);
      setDraftRecentSets(await listRecentSetDrafts(3));
    } catch {
      setError("Could not save quick log.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRepeatLast() {
    setError("");
    setIsSaving(true);
    try {
      const result = await repeatLastSession(date);
      if (!result) {
        setError("No previous session to repeat.");
        return;
      }
      setToast("Repeated your last session.");
      setDraftRecentSets(await listRecentSetDrafts(3));
    } catch {
      setError("Could not repeat last session.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRepeatLastSet() {
    const draft = await getLastSetDraft();
    if (!draft) {
      setError("No last set found.");
      return;
    }
    if (!draft.exerciseId || draft.exerciseId === "unknown") {
      setError("Last set exercise is not available.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await upsertSessionWithDetails({
        date,
        painFlag: false,
        exercises: [
          {
            exerciseId: draft.exerciseId,
            sets: [
              {
                reps: draft.reps,
                weightKg: draft.weightKg,
                rpe: draft.rpe,
                restSeconds: draft.restSeconds ?? 90,
                formQualityFlag: draft.formQualityFlag ?? false,
              },
            ],
          },
        ],
      });
      setDraftExerciseId(draft.exerciseId);
      setDraftReps(draft.reps);
      setDraftWeightKg(typeof draft.weightKg === "number" ? draft.weightKg : "");
      setDraftRecentSets(await listRecentSetDrafts(3));
      setToast("Saved: repeated last set");
    } catch {
      setError("Could not repeat last set.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveDraftSet() {
    if (!draftExerciseId) {
      setError("Select an exercise for draft set.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await upsertSessionWithDetails({
        date,
        painFlag: false,
        exercises: [
          {
            exerciseId: draftExerciseId,
            sets: [
              {
                reps: draftReps,
                weightKg: typeof draftWeightKg === "number" ? draftWeightKg : undefined,
                restSeconds: 90,
                formQualityFlag: false,
              },
            ],
          },
        ],
      });
      await saveLastSetDraft({
        exerciseId: draftExerciseId,
        exerciseName: selectedDraftExercise?.name,
        reps: draftReps,
        weightKg: typeof draftWeightKg === "number" ? draftWeightKg : undefined,
        restSeconds: 90,
        formQualityFlag: false,
      });
      setDraftRecentSets(await listRecentSetDrafts(3));
      setToast("Saved");
    } catch {
      setError("Could not save draft set.");
    } finally {
      setIsSaving(false);
    }
  }

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
        if (set.weightKg !== "" && (set.weightKg < 0 || set.weightKg > 1000)) {
          setError("Weight must be between 0 and 1000kg.");
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
          weightKg: set.weightKg === "" ? undefined : Number(set.weightKg),
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
      {toast ? (
        <div className="rounded border border-emerald-700/60 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
          {toast}
        </div>
      ) : null}
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
        <p className="mb-2 text-sm font-medium text-slate-200">Quick Log</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleQuickLog("Push-up", 10)}
            className="rounded bg-black px-3 py-1.5 text-xs text-white disabled:opacity-50"
          >
            Push-up 10 reps
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleQuickLog("Bodyweight Squat", 15)}
            className="rounded bg-black px-3 py-1.5 text-xs text-white disabled:opacity-50"
          >
            Squat 15 reps
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleQuickLog("Pull-up", 5)}
            className="rounded bg-black px-3 py-1.5 text-xs text-white disabled:opacity-50"
          >
            Pull-up 5 reps
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleRepeatLastSet()}
            className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-200 disabled:opacity-50"
          >
            Repeat last set
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleRepeatLast()}
            className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-200 disabled:opacity-50"
          >
            Repeat last log
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 p-3">
        <p className="mb-2 text-sm font-medium text-slate-200">Start from Course</p>
        <div className="grid gap-2 md:grid-cols-2">
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setSelectedDayIndex(""); // Reset day when course changes
            }}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <select
            value={selectedDayIndex}
            onChange={(e) => setSelectedDayIndex(Number(e.target.value))}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
            disabled={!selectedCourseId}
          >
            <option value="">Select day</option>
            {selectedCourseId &&
              courses
                .find((course) => course.id === selectedCourseId)
                ?.days.map((day, index) => (
                  <option key={index} value={index}>
                    {day.day}
                  </option>
                ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 p-3">
        <p className="mb-2 text-sm font-medium text-slate-200">Last Set Draft</p>
        <div className="grid gap-2 md:grid-cols-5">
          <select
            value={draftExerciseId}
            onChange={(event) => setDraftExerciseId(event.target.value)}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
          >
            <option value="">Select exercise</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDraftReps((prev) => Math.max(0, prev - 1))}
              className="rounded border border-slate-700 px-2"
            >
              -1
            </button>
            <input
              type="number"
              value={draftReps}
              min={0}
              max={500}
              onChange={(event) => setDraftReps(Math.max(0, Number(event.target.value) || 0))}
              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => setDraftReps((prev) => Math.min(500, prev + 1))}
              className="rounded border border-slate-700 px-2"
            >
              +1
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setDraftWeightKg((prev) => {
                  const base = typeof prev === "number" ? prev : 0;
                  return Math.max(0, Number((base - 2.5).toFixed(1)));
                })
              }
              className="rounded border border-slate-700 px-2"
            >
              -2.5
            </button>
            <input
              type="number"
              step={0.5}
              min={0}
              max={1000}
              value={draftWeightKg}
              placeholder="kg"
              onChange={(event) =>
                setDraftWeightKg(event.target.value === "" ? "" : Math.max(0, Number(event.target.value)))
              }
              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() =>
                setDraftWeightKg((prev) => {
                  const base = typeof prev === "number" ? prev : 0;
                  return Number((base + 2.5).toFixed(1));
                })
              }
              className="rounded border border-slate-700 px-2"
            >
              +2.5
            </button>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleSaveDraftSet()}
            className="rounded bg-black px-3 py-1.5 text-xs text-white disabled:opacity-50"
          >
            Save Draft Set
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {draftRecentSets.map((set) => (
            <button
              key={`${set.exerciseId}-${set.updatedAt}`}
              type="button"
              onClick={() => {
                if (set.exerciseId !== "unknown") setDraftExerciseId(set.exerciseId);
                setDraftReps(set.reps);
                setDraftWeightKg(typeof set.weightKg === "number" ? set.weightKg : "");
              }}
              className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300"
            >
              {set.exerciseName ?? "Unknown"} {set.reps} reps
              {typeof set.weightKg === "number" ? ` / ${set.weightKg}kg` : ""}
            </button>
          ))}
        </div>
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
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateSet(
                        block.exerciseId,
                        setIndex,
                        "weightKg",
                        Math.max(0, Number(((typeof set.weightKg === "number" ? set.weightKg : 0) - 2.5).toFixed(1)))
                      )
                    }
                    className="rounded border border-slate-700 px-2"
                  >
                    -2.5
                  </button>
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    max={1000}
                    placeholder="Weight kg"
                    value={set.weightKg}
                    onChange={(event) =>
                      updateSet(
                        block.exerciseId,
                        setIndex,
                        "weightKg",
                        event.target.value === "" ? "" : Math.max(0, Number(event.target.value))
                      )
                    }
                    className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateSet(
                        block.exerciseId,
                        setIndex,
                        "weightKg",
                        Number(((typeof set.weightKg === "number" ? set.weightKg : 0) + 2.5).toFixed(1))
                      )
                    }
                    className="rounded border border-slate-700 px-2"
                  >
                    +2.5
                  </button>
                </div>
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
        className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save Session"}
      </button>
      <button
        type="button"
        onClick={() => router.push("/")}
        className="ml-2 rounded border border-slate-700 px-3 py-2 text-sm text-slate-200"
      >
        Back to Dashboard
      </button>
    </section>
  );
}
