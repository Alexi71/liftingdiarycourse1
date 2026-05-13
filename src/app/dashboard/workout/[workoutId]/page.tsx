import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutWithExercises } from "@/data/workouts";
import { getExercises } from "@/data/exercises";
import WorkoutLogger from "./WorkoutLogger";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { workoutId } = await params;
  const [workout, exercises] = await Promise.all([
    getWorkoutWithExercises(userId, workoutId),
    getExercises(),
  ]);
  if (!workout) notFound();

  return (
    <div className="max-w-2xl mx-auto w-full p-6">
      <WorkoutLogger workout={workout} exercises={exercises} />
    </div>
  );
}
