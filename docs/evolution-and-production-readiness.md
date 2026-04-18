# Evolution and production readiness

This doc covers two things the PoC left out: how the feature should evolve past v1, and what would
actually be needed to ship it to customers.

## 1. Evolution

The current editor is linear on purpose. Most of the items below can be added without breaking the
workflow schema, which is the whole point of investing in the registry and the serialized model
early.

- **OR conditions** first, I’d add OR conditions next to the existing AND group, since it reuses the
  same primitive and doesn’t require schema changes since the model is already a tree..
- **Long-running workflows**: cron-based triggers, recurring runs, delays between steps. This is
  mostly backend work, but the UI needs a notion of "schedule" and a run timeline.
- **Human-in-the-loop steps** (manual approval, review). These introduce a new step kind that pauses
  execution and waits for input..
- **AI-assisted creation**. The schema is already machine-readable and zod-validated, so an LLM can
  emit a workflow JSON and we validate it the same way we validate user input. First use cases:
  "describe your workflow in plain english", suggested next step, natural-language condition
  builder.
- **Template catalog / marketplace** of pre-configured workflows. Low-effort once the registry is
  stable, and it's usually what drives adoption.

The ordering above is roughly what I'd prioritize, but AI-assisted creation is the one that could
jump the queue depending on how the rest of the product is moving.

## 2. What's missing for a production release

Assuming the backend is in place, these are the gaps between the current PoC and something we could
put in front of paying customers.

### Core Product integration

In the case we want to integrate this feature into the core product, we need to:

- Drop the standalone app shell and mount the feature inside Formbricks' existing Next.js app, using
  its layout, navigation and auth.
- Add a "Workflows" entry to the main side nav, under the Surveys or Contacts items.
- Align on Formbricks' component patterns where they diverge from what's here (forms, toasts, empty
  states).

Many components might already exist in Formbricks, so we can reuse them, and new ones might need to
be ported or adapted for this new feature.

### Data, auth and multi-tenancy

- Replace the mocked store with the real backend and wire up authentication.
- Integrate with orgs, workspaces, users, roles and permissions (ACLs). At minimum: who can view,
  edit, enable/disable, and manually trigger a workflow.
- Plan-based limits (number of workflows, steps per workflow, runs per month, etc.). These should
  surface in the UI _before_ the user hits them: a disabled "add step" with a tooltip, not a 4xx
  errro after save.

### UI polish

In general we need to make the design consistent, and think about corner cases, usability,
performance, errors and usage constraints.

- Design adjustments for consistency (spacing, typography, empty/error/loading states).
- Corner cases: very long labels, many conditions (hundreds? what limit do we allow?), deeply nested
  values, slow networks.
- Accessibility: keyboard nav across the editor, focus management in the drawer, proper ARIA for the
  condition builder, screen reader pass.
- Cross-browser testing (Safari in particular tends to surface focus issues).
- Performance: test the UI under stress (long lists and conditions, slow networks, etc.), as well as
  using React Scan to detect unecessary re-renders and optimize them.
- Mobile / small-screen: Small adjustments are needed to make the UI work on mobile, but since
  Formbricks doesn't support mobile yet, we can postpone it for now.

### Safety and abuse prevention

- Rate-limit manual triggers from the UI. The server has to enforce it too, the UI is only a first
  line of defense.
- Throttle save /autosave requests.
- Guardrails around destructive actions (delete workflow, disable in production).
- Triggering workflows manually should maybe also be throttled in the UI.

### Observability

- Run history per workflow: last run, status, duration, which step failed and why.
- Debug logs available from the editor, at least for the latest runs.
- Success rate / failure tracking surfaced on the list page so users can spot broken workflows
  without opening each one.
- Product metrics: workflows created, activation rate, most-used actions. These inform what to
  invest in next.

### Real integrations

Run end-to-end tests against the actual third-party APIs (Slack, HubSpot, etc.), not just mocks.

Integrations break in production in ways that are very hard to catch in unit tests: OAuth expiry,
rate limits, schema drift on the provider side.

### Testing

- Unit tests around the registry, the schema and the condition evaluator.
- A handful of Playwright flows covering create → edit → enable → trigger.
- Visual regression on the editor would be nice to have but not a blocker.
