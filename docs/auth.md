# Authentication

## Provider: Clerk

**This application uses Clerk for all authentication.** Do NOT implement custom auth, JWT handling, session management, or any other auth mechanism.

- Do NOT use NextAuth, Auth.js, or any other auth library
- Do NOT create custom login/signup pages — use Clerk's hosted or embedded components
- Do NOT store passwords, tokens, or session data manually

## Getting the Current User

Retrieve the authenticated user's ID in Server Components using Clerk's `auth()` helper:

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // use userId to scope data queries
}
```

**Never** read the user ID from URL params, query strings, or request bodies to determine ownership. Always use `userId` from `auth()`.

## Protecting Routes

Use Clerk's middleware to protect routes globally. Configure `clerkMiddleware` in `middleware.ts` at the project root:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

- Public routes (sign-in, sign-up) are explicitly opted out of protection
- All other routes are protected by default
- Never manually check auth inside individual pages when middleware already covers the route

## UI Components

Use Clerk's pre-built components for all auth-related UI:

```tsx
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

// Show sign-in/sign-up buttons to unauthenticated users
<SignedOut>
  <SignInButton />
  <SignUpButton />
</SignedOut>

// Show user avatar/menu to authenticated users
<SignedIn>
  <UserButton />
</SignedIn>
```

Do NOT build custom user avatars, logout buttons, or auth state toggles — use Clerk components.

## Environment Variables

Clerk requires these variables in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Never commit these values. Never hard-code them in source files.

## Summary

| Concern | Rule |
|---|---|
| Auth provider | Clerk only |
| Current user ID | `auth()` from `@clerk/nextjs/server` |
| Route protection | `clerkMiddleware` in `middleware.ts` |
| Auth UI | Clerk components (`SignInButton`, `UserButton`, etc.) |
| Custom auth logic | Never |
| User ID from URL/params | Never — always use session |
