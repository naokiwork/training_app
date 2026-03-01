import { z } from "zod";

export const InputSetSchema = z.object({
  reps: z.number().int().min(0).max(500),
  rpe: z.number().min(0).max(10).optional(),
  restSeconds: z.number().int().min(0).max(3600).optional(),
  formQualityFlag: z.boolean().optional(),
});

export const InputExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.array(InputSetSchema).min(1).max(30),
});

export const CreateOrUpdateLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  painFlag: z.boolean().optional(),
  exercises: z.array(InputExerciseSchema).min(1).max(30),
});

export const AuthSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
});
