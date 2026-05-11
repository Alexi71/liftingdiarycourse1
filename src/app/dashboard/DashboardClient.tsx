"use client";

import { useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

type Workout = { id: number; name: string; sets: number; reps: number; weight: number };

const MOCK_WORKOUTS_BY_DATE: Record<string, Workout[]> = {
  "2026-05-11": [
    { id: 1, name: "Squat", sets: 4, reps: 5, weight: 100 },
    { id: 2, name: "Bench Press", sets: 3, reps: 8, weight: 80 },
    { id: 3, name: "Deadlift", sets: 3, reps: 5, weight: 140 },
  ],
  "2026-05-09": [
    { id: 1, name: "Overhead Press", sets: 4, reps: 6, weight: 60 },
    { id: 2, name: "Pull-up", sets: 3, reps: 8, weight: 0 },
  ],
};

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const dateParam = searchParams.get("date");
  const date: Date = (() => {
    if (dateParam) {
      const parsed = parseISO(dateParam);
      if (isValid(parsed)) return parsed;
    }
    return new Date();
  })();

  const handleDateSelect = useCallback(
    (d: Date | undefined) => {
      if (!d) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", format(d, "yyyy-MM-dd"));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const workouts = MOCK_WORKOUTS_BY_DATE[format(date, "yyyy-MM-dd")] ?? [];

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
          <div className="flex flex-col gap-3">
            {workouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-base">{workout.name}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground">
                    {workout.sets} sets × {workout.reps} reps @ {workout.weight} kg
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
