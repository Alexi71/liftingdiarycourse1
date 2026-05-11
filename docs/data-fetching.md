# Data Fetching

## Core Rule: Server Components Only

ALL data fetching in this application MUST be done via React Server Components. This is a hard requirement — no exceptions.

**Never fetch data via:**
- Route handlers (`app/api/` routes)
- Client components (`"use client"`)
- `useEffect` + `fetch`
- SWR, React Query, or any client-side fetching library

**Always fetch data via:**
- Async React Server Components that `await` data directly

```tsx
// CORRECT
export default async function WorkoutsPage() {
  const workouts = await getWorkoutsByUser(userId);
  return <WorkoutList workouts={workouts} />;
}

// WRONG — do not do this
export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  useEffect(() => { fetch("/api/workouts").then(...) }, []);
}
```

## Database Queries: /data Directory

All database queries MUST be implemented as helper functions inside the `/data` directory. These functions use Drizzle ORM exclusively.

**Never write raw SQL.** Use Drizzle's query builder at all times.

```ts
// CORRECT — /data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsByUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}

// WRONG — raw SQL
const result = await db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`);
```

## Data Isolation: Users Must Only Access Their Own Data

This is a security requirement. Every query that returns user-owned data MUST filter by the authenticated user's ID. Never return data without scoping it to the current user.

- Retrieve the authenticated user's ID from the session inside the Server Component before calling any `/data` helper.
- Pass `userId` explicitly into every `/data` helper function.
- Every `/data` helper that touches user-owned records MUST include a `where eq(table.userId, userId)` clause (or equivalent join condition).
- Never trust a user-supplied ID from params or query strings as the `userId` for ownership — always use the session.

```tsx
// Server Component — correct pattern
import { auth } from "@/auth";
import { getWorkoutsByUser } from "@/data/workouts";

export default async function WorkoutsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workouts = await getWorkoutsByUser(session.user.id);
  return <WorkoutList workouts={workouts} />;
}
```

```ts
// /data/workouts.ts — always scope to userId
export async function getWorkoutsByUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}

// WRONG — missing user scope, leaks all data
export async function getAllWorkouts() {
  return db.select().from(workouts);
}
```

## Summary

| Concern | Rule |
|---|---|
| Where to fetch | Server Components only |
| How to query | Drizzle ORM helper functions in `/data` |
| Raw SQL | Never |
| Client-side fetching | Never |
| Route handler fetching | Never |
| Data scoping | Always filter by authenticated `userId` from session |
