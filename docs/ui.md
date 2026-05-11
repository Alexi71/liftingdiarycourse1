# UI Coding Standards

## Component Library

**ONLY shadcn/ui components must be used for all UI throughout this project.**

- Do NOT create custom UI components under any circumstances
- Do NOT use raw HTML elements styled with Tailwind as standalone components
- Install shadcn/ui components via `npx shadcn@latest add <component>` before use
- All shadcn/ui components live in `src/components/ui/`

## Date Formatting

Use `date-fns` for all date formatting. Dates must follow this format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Implementation

```ts
import { format } from "date-fns";

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
```

Use this `formatDate` helper (or an equivalent) consistently across the project rather than inline format strings.
