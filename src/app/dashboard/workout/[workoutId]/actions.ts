"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";
import {
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  addSet,
  updateSet,
  deleteSet,
} from "@/data/exercises";

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startedAt: z.coerce.date(),
});

export async function updateWorkoutAction(
  workoutId: string,
  name: string,
  date: string,
  startedAt: Date
) {
  const parsed = updateWorkoutSchema.safeParse({ workoutId, name, date, startedAt });
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await updateWorkout(
    userId,
    parsed.data.workoutId,
    parsed.data.name,
    parsed.data.date,
    parsed.data.startedAt
  );
}

const addExerciseSchema = z.object({
  workoutId: z.string().min(1),
  exerciseId: z.string().min(1),
});

export async function addExerciseToWorkoutAction(workoutId: string, exerciseId: string) {
  const parsed = addExerciseSchema.safeParse({ workoutId, exerciseId });
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await addExerciseToWorkout(userId, parsed.data.workoutId, parsed.data.exerciseId);
}

const removeExerciseSchema = z.object({
  workoutExerciseId: z.string().min(1),
});

export async function removeExerciseFromWorkoutAction(workoutExerciseId: string) {
  const parsed = removeExerciseSchema.safeParse({ workoutExerciseId });
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await removeExerciseFromWorkout(userId, parsed.data.workoutExerciseId);
}

const addSetSchema = z.object({
  workoutExerciseId: z.string().min(1),
  reps: z.number().int().positive().optional(),
  weightKg: z.number().positive().optional(),
  durationSec: z.number().int().positive().optional(),
});

export async function addSetAction(
  workoutExerciseId: string,
  reps?: number,
  weightKg?: number,
  durationSec?: number
) {
  const parsed = addSetSchema.safeParse({ workoutExerciseId, reps, weightKg, durationSec });
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await addSet(
    userId,
    parsed.data.workoutExerciseId,
    parsed.data.reps,
    parsed.data.weightKg,
    parsed.data.durationSec
  );
}

const updateSetSchema = z.object({
  setId: z.string().min(1),
  reps: z.number().int().positive().nullable().optional(),
  weightKg: z.number().positive().nullable().optional(),
  durationSec: z.number().int().positive().nullable().optional(),
});

export async function updateSetAction(
  setId: string,
  reps?: number | null,
  weightKg?: number | null,
  durationSec?: number | null
) {
  const parsed = updateSetSchema.safeParse({ setId, reps, weightKg, durationSec });
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await updateSet(userId, parsed.data.setId, parsed.data.reps, parsed.data.weightKg, parsed.data.durationSec);
}

const deleteSetSchema = z.object({
  setId: z.string().min(1),
});

export async function deleteSetAction(setId: string) {
  const parsed = deleteSetSchema.safeParse({ setId });
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await deleteSet(userId, parsed.data.setId);
}
