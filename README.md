# Formbricks Workflows

A linear workflow builder (`trigger → condition → action`) focused on a simple, predictable
authoring experience backed by a stable, extensible schema and action registry. The editor renders
workflows as step cards with a side drawer for editing, prioritizing fast authoring over a graph
canvas.

## Goals

- Simple, linear step-based editor (trigger, optional condition, one or more actions)
- Stable, serializable workflow schema as the long-term API
- Extensible action/trigger registry driven by configuration
- Schema-driven validation (Zod) to prevent invalid configurations by design
- Basic app shell: header, side nav, workflows list, editor page
- Accessible, keyboard-friendly UI

## Non-goals

- Backend / server implementation (data is in-memory / mocked)
- Authentication, multi-tenancy, permissions
- Real integrations (actual API calls to Slack, HubSpot, etc.)
- Graph canvas, branching, loops, parallel steps
- Drag-and-drop reordering
- Long-running / human-in-the-loop workflows
- AI-assisted workflow generation
- Run history, logs, analytics
- Mobile / responsive layouts below tablet
- Dark mode / theming
- Internationalization
- Testing infrastructure (unit, e2e)

## Tech stack decisions

The tech stack is based on the one proposed in the [docs/proposal.md](docs/proposal.md) file, except
for the following:

- TanStack Query: React Router 7 loaders/actions already own fetching, caching, revalidation and SSR
  streaming, so adding Query would duplicate the cache and split the source of truth. It would only
  pay off against a separate REST API we don't have here.

- React Hook Form: The editor is a shared document edited across inspectors, popovers and the
  header, not a single `<form>` with one submit. Jotai + Immer model that document directly, and the
  same Zod `validate()` runs on client and server, so RHF + resolvers would just mirror state we
  already own.

## Development

```bash
pnpm dev
```

## Production

```bash
pnpm start
```
