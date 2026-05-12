"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { updateWorkoutAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Workout } from "@/db/schema";

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

export default function EditWorkoutForm({ workout }: { workout: Workout }) {
  const router = useRouter();
  const [name, setName] = useState(workout.name);
  const [date, setDate] = useState<Date>(parseISO(workout.date));
  const [time, setTime] = useState(format(workout.startedAt, "HH:mm"));
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const [hours, minutes] = time.split(":").map(Number);
    const startedAt = new Date(date);
    startedAt.setHours(hours, minutes, 0, 0);
    await updateWorkoutAction(workout.id, name, format(date, "yyyy-MM-dd"), startedAt);
    router.push(`/dashboard?date=${format(date, "yyyy-MM-dd")}`);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Edit Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Workout Name
            </label>
            <Input
              id="name"
              placeholder="e.g. Morning Push Day"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger className="flex h-9 w-full items-center justify-start gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-normal shadow-xs hover:bg-accent hover:text-accent-foreground">
                <CalendarIcon className="size-4" />
                {formatDate(date)}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="time" className="text-sm font-medium">
              Start Time
            </label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              {pending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
