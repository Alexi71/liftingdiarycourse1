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
