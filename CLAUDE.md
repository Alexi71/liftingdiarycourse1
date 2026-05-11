# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application with TypeScript and Tailwind CSS v4, using the App Router architecture with Turbopack enabled for both development and production builds.

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # run ESLint
```

No test suite is configured yet.

## Code Generation Guidelines

**IMPORTANT**: When generating ANY code, you MUST ALWAYS first read the relevant documentation files within the `/docs` directory before writing a single line of implementation. This is a hard requirement — no exceptions. Understand the existing patterns, conventions, and best practices documented there, then implement in strict accordance with them.

Available docs:
- /docs/ui.md
- /docs/data-fetching.md
- /docs/auth.md
- /docs/data-mutations.md


## Architecture
- **App Router**: Located at `src/app/` with `layout.tsx` and `page.tsx` files
- **Styling**: Tailwind CSS v4 with PostCSS configuration
- **Path Alias**: `@/*` maps to `./src/*` for cleaner imports
- **Font System**: Uses Geist fonts configured in the root layout