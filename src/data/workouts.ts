import { db } from "@/db";
import { workouts, workoutExercises, sets } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function createWorkout(userId: string, name: string, date: string, startedAt: Date) {
  return db.insert(workouts).values({ userId, name, date, startedAt });
}

export async function getWorkoutsForDate(userId: string, date: string) {
  return db.query.workouts.findMany({
    where: and(eq(workouts.userId, userId), eq(workouts.date, date)),
    with: {
      workoutExercises: {
        orderBy: workoutExercises.order,
        with: {
          exercise: true,
          sets: {
            orderBy: sets.setNumber,
          },
        },
      },
    },
  });
}

export type WorkoutsForDate = Awaited<ReturnType<typeof getWorkoutsForDate>>;

export async function getWorkoutById(userId: string, workoutId: string) {
  return db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
  });
}

export async function getWorkoutWithExercises(userId: string, workoutId: string) {
  return db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
    with: {
      workoutExercises: {
        orderBy: workoutExercises.order,
        with: {
          exercise: true,
          sets: {
            orderBy: sets.setNumber,
          },
        },
      },
    },
  });
}

export type WorkoutWithExercises = Awaited<ReturnType<typeof getWorkoutWithExercises>>;

export async function updateWorkout(
  userId: string,
  workoutId: string,
  name: string,
  date: string,
  startedAt: Date
) {
  return db
    .update(workouts)
    .set({ name, date, startedAt })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
