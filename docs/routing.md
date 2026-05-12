# Routing

## Route Structure

All application routes live under `/dashboard`. There are no top-level feature routes.

```
/dashboard              # main dashboard
/dashboard/[feature]    # any sub-page
```

The root `/` may redirect to `/dashboard` or serve a landing page, but all authenticated functionality is under `/dashboard`.

## Route Protection: Middleware Only

All `/dashboard` routes MUST be protected via Next.js middleware using Clerk. Do NOT add per-page auth checks for routes already covered by middleware.

```ts
// middleware.ts (project root)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

- `/sign-in` and `/sign-up` are the only public routes
- Every other route — including all of `/dashboard` — is protected by default
- Never duplicate this protection with manual `if (!userId) redirect(...)` checks inside dashboard pages

## File System Conventions

- Dashboard pages live at `src/app/dashboard/`
- Sub-pages use the Next.js App Router folder convention: `src/app/dashboard/[feature]/page.tsx`
- Each route segment gets its own folder; do not colocate unrelated routes

```
src/app/
  dashboard/
    page.tsx              # /dashboard
    layout.tsx            # shared dashboard layout (optional)
    workout/
      page.tsx            # /dashboard/workout
      [workoutId]/
        page.tsx          # /dashboard/workout/:workoutId
```

## Navigation

Use Next.js `<Link>` for all in-app navigation. Never use `<a href>` for internal routes.

```tsx
import Link from "next/link";

<Link href="/dashboard/workout/123">View Workout</Link>
```

## Redirects

Use Next.js `redirect()` from `next/navigation` for programmatic redirects (e.g., after a mutation):

```ts
import { redirect } from "next/navigation";

redirect("/dashboard");
```

Never use `window.location` or `router.push` from Server Components.

## Summary

| Concern | Rule |
|---|---|
| Route namespace | All app routes under `/dashboard` |
| Route protection | Clerk middleware in `middleware.ts` only |
| Per-page auth checks | Never (middleware already covers it) |
| Public routes | `/sign-in`, `/sign-up` only |
| Internal navigation | `<Link>` from `next/link` |
| Programmatic redirect | `redirect()` from `next/navigation` |
| Route files location | `src/app/dashboard/` |
