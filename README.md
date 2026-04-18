# Formbricks Workflow Builder

Proof of concept for a linear workflow builder (`trigger → condition → action`) focused on a simple,
predictable authoring experience backed by a stable, extensible schema and action registry.

The editor renders workflows as step cards with a side drawer for editing, prioritizing fast
authoring over a graph canvas.

## Setup

Install dependencies:

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Production

```bash
pnpm build && pnpm start
```

## Documentation

- [Proposal](docs/proposal.md)
- [Implementation notes and decisions](docs/implementation-notes.md)
