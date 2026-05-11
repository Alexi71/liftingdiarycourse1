"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(name: string, date: string, startedAt: Date) {
  const parsed = createWorkoutSchema.safeParse({ name, date, startedAt });
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await createWorkout(userId, parsed.data.name, parsed.data.date, parsed.data.startedAt);
}
