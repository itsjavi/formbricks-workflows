# Agents

This is a React Router 7 (aka. RR7) full-stack web app in SSR mode, using React 19+ and TypeScript.

For RR7 docs (summary), check @https://context7.com/remix-run/react-router/llms.txt?tokens=50000

This project also uses:

- lucide-react for icons
- jotai + immer for state management
- react-hook-form for form handling
- zod for validation
- TailwindCSS v4+ for styling
- shadcn/ui components + `@base-ui/react` library (instead of Radix UI) for UI primitives

For routing, we use `file-router-collector` to collect routes from the filesystem, using the same
naming patterns as Next.js App Router.

Core domain logic for the workflows is in the `app/lib/workflows/` directory.
