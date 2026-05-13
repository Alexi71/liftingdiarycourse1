import { db } from "@/db";
import { exercises, workoutExercises, sets, workouts } from "@/db/schema";
import { and, eq, max, count } from "drizzle-orm";

export async function getExercises() {
  return db.select().from(exercises).orderBy(exercises.name);
}

export async function addExerciseToWorkout(
  userId: string,
  workoutId: string,
  exerciseId: string
) {
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
  });
  if (!workout) throw new Error("Workout not found");

  const [{ value: currentCount }] = await db
    .select({ value: count() })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  return db.insert(workoutExercises).values({
    workoutId,
    exerciseId,
    order: Number(currentCount) + 1,
  });
}

export async function removeExerciseFromWorkout(
  userId: string,
  workoutExerciseId: string
) {
  const we = await db.query.workoutExercises.findFirst({
    where: eq(workoutExercises.id, workoutExerciseId),
    with: { workout: true },
  });
  if (!we || we.workout.userId !== userId) throw new Error("Not found");

  return db.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId));
}

export async function addSet(
  userId: string,
  workoutExerciseId: string,
  reps?: number,
  weightKg?: number,
  durationSec?: number
) {
  const we = await db.query.workoutExercises.findFirst({
    where: eq(workoutExercises.id, workoutExerciseId),
    with: { workout: true },
  });
  if (!we || we.workout.userId !== userId) throw new Error("Not found");

  const [{ value: currentMax }] = await db
    .select({ value: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  return db.insert(sets).values({
    workoutExerciseId,
    setNumber: (currentMax ?? 0) + 1,
    reps: reps ?? null,
    weightKg: weightKg ?? null,
    durationSec: durationSec ?? null,
  });
}

export async function updateSet(
  userId: string,
  setId: string,
  reps?: number | null,
  weightKg?: number | null,
  durationSec?: number | null
) {
  const set = await db.query.sets.findFirst({
    where: eq(sets.id, setId),
    with: {
      workoutExercise: {
        with: { workout: true },
      },
    },
  });
  if (!set || set.workoutExercise.workout.userId !== userId) throw new Error("Not found");

  return db.update(sets).set({ reps, weightKg, durationSec }).where(eq(sets.id, setId));
}

export async function deleteSet(userId: string, setId: string) {
  const set = await db.query.sets.findFirst({
    where: eq(sets.id, setId),
    with: {
      workoutExercise: {
        with: { workout: true },
      },
    },
  });
  if (!set || set.workoutExercise.workout.userId !== userId) throw new Error("Not found");

  return db.delete(sets).where(eq(sets.id, setId));
}
