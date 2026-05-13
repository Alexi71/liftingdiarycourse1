"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addSetAction, updateSetAction, deleteSetAction } from "./actions";
import type { WorkoutWithExercises } from "@/data/workouts";

type WorkoutExercise = NonNullable<WorkoutWithExercises>["workoutExercises"][number];

type Props = {
  workoutExercise: WorkoutExercise;
  onRemove: () => void;
  onRefresh: () => void;
};

type SetRow = WorkoutExercise["sets"][number];

export default function ExerciseBlock({ workoutExercise, onRemove, onRefresh }: Props) {
  const [addingSet, setAddingSet] = useState(false);

  async function handleAddSet() {
    setAddingSet(true);
    await addSetAction(workoutExercise.id);
    onRefresh();
    setAddingSet(false);
  }

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{workoutExercise.exercise.name}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {workoutExercise.sets.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground px-1">
            <span>Set</span>
            <span>Reps</span>
            <span>Weight (kg)</span>
            <span>Duration (s)</span>
          </div>
          {workoutExercise.sets.map((set) => (
            <SetRow key={set.id} set={set} onRefresh={onRefresh} />
          ))}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleAddSet}
        disabled={addingSet}
      >
        <Plus className="h-4 w-4 mr-1" />
        {addingSet ? "Adding…" : "Add set"}
      </Button>
    </div>
  );
}

function SetRow({ set, onRefresh }: { set: SetRow; onRefresh: () => void }) {
  const [reps, setReps] = useState(set.reps?.toString() ?? "");
  const [weight, setWeight] = useState(set.weightKg?.toString() ?? "");
  const [duration, setDuration] = useState(set.durationSec?.toString() ?? "");
  const [deleting, setDeleting] = useState(false);

  async function handleBlur() {
    await updateSetAction(
      set.id,
      reps !== "" ? Number(reps) : null,
      weight !== "" ? Number(weight) : null,
      duration !== "" ? Number(duration) : null
    );
    onRefresh();
  }

  async function handleDelete() {
    setDeleting(true);
    await deleteSetAction(set.id);
    onRefresh();
  }

  return (
    <div className="grid grid-cols-4 gap-2 items-center">
      <span className="text-sm px-1">{set.setNumber}</span>
      <Input
        type="number"
        min={1}
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={handleBlur}
        className="h-8 text-sm"
        placeholder="—"
      />
      <Input
        type="number"
        min={0}
        step={0.5}
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={handleBlur}
        className="h-8 text-sm"
        placeholder="—"
      />
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          onBlur={handleBlur}
          className="h-8 text-sm"
          placeholder="—"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
