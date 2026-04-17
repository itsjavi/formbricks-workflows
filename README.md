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

## Development

```bash
pnpm dev
```

## Production

```bash
pnpm start
```
