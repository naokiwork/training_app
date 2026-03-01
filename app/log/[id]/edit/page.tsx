import { notFound } from "next/navigation";
import { getUserIdFromCookieStore } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditLogForm } from "./EditLogForm";
import type { InitialSession } from "./EditLogForm";

export default async function EditLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getUserIdFromCookieStore();
  const session = await prisma.workoutSession.findFirst({
    where: { id, userId },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: {
            orderBy: { setOrder: "asc" },
          },
        },
        orderBy: { exerciseOrder: "asc" },
      },
    },
  });

  if (!session) notFound();

  const initial: InitialSession = {
    id: session.id,
    date: session.date,
    painFlag: session.painFlag,
    exercises: session.exercises.map((exerciseBlock) => ({
      exerciseId: exerciseBlock.exerciseId,
      exerciseName: exerciseBlock.exercise.name,
      sets: exerciseBlock.sets.map((set) => ({
        reps: set.reps,
        rpe: set.rpe === null ? "" : set.rpe,
        restSeconds: set.restSeconds ?? 90,
        formQualityFlag: set.formQualityFlag,
      })),
    })),
  };

  return <EditLogForm initial={initial} />;
}
