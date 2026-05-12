"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";

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
