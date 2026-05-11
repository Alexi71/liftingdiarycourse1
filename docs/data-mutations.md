# Data Mutations

## Core Rules

ALL data mutations in this application MUST follow two rules without exception:

1. **DB calls are wrapped in helper functions** inside `src/data/`
2. **Mutations are invoked via Server Actions** defined in colocated `actions.ts` files

**Never mutate data via:**
- Route handlers (`app/api/` routes)
- Client components directly calling the database
- Raw Drizzle calls outside of `src/data/` helpers

## `/data` Helpers

Every mutation that touches the database MUST be implemented as a helper function in `src/data/`. These functions use Drizzle ORM exclusively — no raw SQL.

```ts
// CORRECT — src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function createWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date });
}

export async function deleteWorkout(userId: string, workoutId: string) {
  return db.delete(workouts).where(
    and(eq(workouts.id, workoutId), eq(workouts.userId, userId))
  );
}

// WRONG — raw SQL
await db.execute(sql`INSERT INTO workouts ...`);

// WRONG — Drizzle call directly inside a Server Action or component
await db.insert(workouts).values({ ... });
```

Always scope mutations to the authenticated `userId` — never mutate records without verifying ownership.

## Server Actions

All mutations MUST be triggered via Server Actions. Server Actions MUST live in a file named `actions.ts`, colocated with the route or feature they belong to:

```
src/app/workouts/actions.ts         ← actions for the workouts feature
src/app/workouts/[id]/actions.ts    ← actions scoped to a single workout
```

Each `actions.ts` file MUST begin with the `"use server"` directive:

```ts
"use server";
```

## Typed Parameters — No FormData

Server Action parameters MUST be explicitly typed. **Never use `FormData` as a parameter type.**

```ts
// CORRECT — typed parameters
export async function createWorkout(name: string, date: Date) { ... }

// WRONG — FormData
export async function createWorkout(formData: FormData) { ... }
```

Pass structured data from the calling component instead of raw form data.

## Zod Validation

**Every Server Action MUST validate its arguments with Zod** before doing anything else — including auth checks or DB calls.

Define a Zod schema for each action's inputs and parse at the top of the function:

```ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

export async function createWorkoutAction(name: string, date: Date) {
  const parsed = createWorkoutSchema.safeParse({ name, date });
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await createWorkout(userId, parsed.data.name, parsed.data.date);
}
```

- Use `safeParse` and handle the failure case explicitly
- Never skip validation even for "internal" actions
- Schema definitions should live at the top of the `actions.ts` file, above the action functions

## Full Pattern Example

```
src/app/workouts/
  page.tsx          ← Server Component, renders the form
  actions.ts        ← Server Actions with Zod validation
src/data/
  workouts.ts       ← Drizzle helper functions
```

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function createWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date });
}
```

```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

export async function createWorkoutAction(name: string, date: Date) {
  const parsed = createWorkoutSchema.safeParse({ name, date });
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await createWorkout(userId, parsed.data.name, parsed.data.date);
}
```

## Redirects

**Never call `redirect()` inside a Server Action.** Redirects must be handled client-side after the action resolves.

```ts
// WRONG — redirect inside a Server Action
export async function createWorkoutAction(name: string, date: Date) {
  // ... validation, auth, DB call ...
  redirect("/dashboard"); // ❌
}

// CORRECT — action returns, client navigates
export async function createWorkoutAction(name: string, date: Date) {
  // ... validation, auth, DB call ...
  // return nothing (or return data the caller needs)
}

// In the calling Client Component:
async function handleSubmit() {
  await createWorkoutAction(name, date);
  router.push("/dashboard"); // ✅
}
```

## Summary

| Concern | Rule |
|---|---|
| Where to put DB mutation logic | `src/data/` helper functions, Drizzle ORM only |
| Where to put mutation invocations | `actions.ts` files colocated with the feature |
| Server Action directive | `"use server"` at top of every `actions.ts` |
| Parameter types | Explicit TypeScript types — never `FormData` |
| Input validation | Zod `safeParse` at the top of every action |
| Raw SQL | Never |
| Route handler mutations | Never |
| Unscoped mutations | Never — always filter by authenticated `userId` |
| Redirects after mutation | Never in Server Actions — use `router.push()` client-side |
