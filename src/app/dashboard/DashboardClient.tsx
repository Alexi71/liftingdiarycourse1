"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkoutsForDate } from "@/data/workouts";

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function formatDate(date: Date): string {
  const day = format(date, "d");
  const suffix = getOrdinalSuffix(Number(day));
  return `${day}${suffix} ${format(date, "MMM yyyy")}`;
}

type Props = {
  workouts: WorkoutsForDate;
  selectedDate: string;
};

export default function DashboardClient({ workouts, selectedDate }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const date = parseISO(selectedDate);

  const handleDateSelect = useCallback(
    (d: Date | undefined) => {
      if (!d) return;
      router.push(`${pathname}?date=${format(d, "yyyy-MM-dd")}`);
    },
    [router, pathname]
  );

  return (
    <main className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Popover>
          <PopoverTrigger className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent hover:text-accent-foreground">
            <CalendarIcon className="h-4 w-4" />
            {formatDate(date)}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-3">
          Workouts for {formatDate(date)}
        </h2>
        {workouts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No workouts logged for this date.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {workouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-base">{workout.name}</CardTitle>
                  {workout.startedAt && (
                    <p className="text-xs text-muted-foreground">
                      Started at {format(new Date(workout.startedAt), "h:mm a")}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="px-4 pb-4 flex flex-col gap-3">
                  {workout.workoutExercises.map((we) => (
                    <div key={we.id}>
                      <p className="text-sm font-medium">{we.exercise.name}</p>
                      <div className="flex flex-col gap-1 mt-1">
                        {we.sets.map((s) => (
                          <p key={s.id} className="text-sm text-muted-foreground">
                            Set {s.setNumber}
                            {s.reps != null ? ` · ${s.reps} reps` : ""}
                            {s.weightKg != null ? ` @ ${s.weightKg} kg` : ""}
                            {s.durationSec != null ? ` · ${s.durationSec}s` : ""}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
