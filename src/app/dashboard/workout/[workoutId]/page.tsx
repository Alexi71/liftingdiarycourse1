import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import EditWorkoutForm from "./EditWorkoutForm";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const { workoutId } = await params;
  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) notFound();

  return (
    <div className="flex min-h-screen items-start justify-center p-8">
      <EditWorkoutForm workout={workout} />
    </div>
  );
}
