"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addExerciseToWorkoutAction, removeExerciseFromWorkoutAction } from "./actions";
import ExerciseBlock from "./ExerciseBlock";
import AddExerciseCombobox from "./AddExerciseCombobox";
import EditWorkoutForm from "./EditWorkoutForm";
import type { WorkoutWithExercises } from "@/data/workouts";
import type { Exercise } from "@/db/schema";

function formatDate(date: Date): string {
  const day = format(date, "d");
  const suffix = getOrdinalSuffix(Number(day));
  return `${day}${suffix} ${format(date, "MMM yyyy")}`;
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

type Props = {
  workout: NonNullable<WorkoutWithExercises>;
  exercises: Exercise[];
};

export default function WorkoutLogger({ workout, exercises }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [addingExercise, setAddingExercise] = useState(false);

  function refresh() {
    router.refresh();
  }

  async function handleAddExercise(exerciseId: string) {
    setAddingExercise(true);
    await addExerciseToWorkoutAction(workout.id, exerciseId);
    refresh();
    setAddingExercise(false);
  }

  async function handleRemoveExercise(workoutExerciseId: string) {
    await removeExerciseFromWorkoutAction(workoutExerciseId);
    refresh();
  }

  const date = parseISO(workout.date);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{workout.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDate(date)} · {format(new Date(workout.startedAt), "h:mm a")}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setEditOpen((v) => !v)}
        >
          {editOpen ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" /> Hide
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" /> Edit
            </>
          )}
        </Button>
      </div>

      {editOpen && (
        <EditWorkoutForm workout={workout} />
      )}

      <div className="flex flex-col gap-3">
        {workout.workoutExercises.map((we) => (
          <ExerciseBlock
            key={we.id}
            workoutExercise={we}
            onRemove={() => handleRemoveExercise(we.id)}
            onRefresh={refresh}
          />
        ))}
      </div>

      <AddExerciseCombobox
        exercises={exercises}
        onSelect={handleAddExercise}
        disabled={addingExercise}
      />
    </div>
  );
}
