import { db } from "@/db";
import { workouts, workoutExercises, sets } from "@/db/schema";
import { and, eq } from "drizzle-orm";

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
