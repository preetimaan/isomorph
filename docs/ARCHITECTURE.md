# Isomorph — Architecture

Personal knowledge graph SPA. Maps **technologies** to stable **responsibilities** (not syntax), grouped by **ecosystems**. v0 is read-only: edit YAML on disk, validate via CLI, browse in the UI.

## Core idea

```
"How do I transfer skill from Pydantic to Zod?"
         │
         ▼
  Same responsibility (validation)
         │
    ┌────┴────┐
 Pydantic    Zod
    │         │
    └─ alternative_to ─┘
```

Compare page diffs **fulfilled responsibilities**, not API surface area.

## System boundary

```
data/*.yaml  ──►  schema/graph.ts  ──►  React UI (static SPA)
       ▲                  ▲
       │                  │
 scripts/validate.ts      │
 scripts/loadGraphFromDisk.ts
```

No backend, no database, no in-app CRUD in v0.

## Data model

**Node types** (3):

| Type | Example | Role |
|------|---------|------|
| `responsibility` | validation, serialization | Stable system role |
| `technology` | pydantic, zod, joi | Concrete tool |
| `ecosystem` | fastapi, node, nestjs | Stack grouping |

**Edge types** (6 in schema; 5 seeded in v0 UI filters):

| Type | Direction | Semantics |
|------|-----------|-----------|
| `fulfills` | technology → responsibility | "This tool does this job" |
| `alternative_to` | technology ↔ technology | Cross-stack equivalents; store once (`from` < `to` alphabetically) |
| `commonly_paired` | technology → technology | Often used together |
| `belongs_to` | technology → ecosystem | Stack membership |
| `depends_on` | technology → technology | Hard dependency |
| `replaces` | technology → technology | Migration path (schema ready; no seed edges yet) |

Nodes carry optional personal fields: `maturity`, `notes`, `sources`.

## Layering

| Layer | Path | Role |
|-------|------|------|
| **Source of truth** | `data/` | YAML nodes + `relationships.yaml` |
| **Domain + validation** | `schema/graph.ts` | Zod schemas, semantic rules (edge direction/type), query helpers |
| **CLI loader** | `scripts/loadGraphFromDisk.ts` | Node `fs` read for validation outside Vite |
| **UI loader** | `src/graph/loadGraph.ts` | Vite `import.meta.glob` for bundling + HMR |
| **State** | `src/context/GraphProvider.tsx` | Load graph once, hot-reload in dev |
| **Pages** | `src/pages/` | Home, Graph, Compare, Relationships, node detail |
| **Viz** | `src/components/GraphCanvas.tsx` | `react-force-graph-2d` |

Both loaders parse through the same Zod schemas — no drift between CLI and UI.

## Key query helpers (`schema/graph.ts`)

- `getAlternatives(technologyId)` — neighbors via `alternative_to`
- `compareTechnologies(a, b)` — shared vs unique fulfilled responsibilities
- `getEcosystemSubgraph(ecosystemId)` — filtered node/edge set
- `getMigrationPaths(technologyId)` — walks `replaces` chains
- `validateGraph()` — structural + semantic validation

## UI routes

| Route | Purpose |
|-------|---------|
| `/` | Search (Fuse.js), browse lists, stats |
| `/graph` | Force-directed explorer, type filters |
| `/compare?left=&right=` | Side-by-side technology comparison |
| `/relationships` | Relationship type guide |
| `/:kind/:id` | Node detail + local subgraph |

## Build pipeline

```bash
yarn validate   # Zod + semantic checks (must pass)
yarn build      # validate → vite build → dist/
```

Validation is a build gate, not optional.

## Design decisions (explain these)

1. **Responsibility-centric graph** — Skills transfer across languages because roles are stable.
2. **YAML + git** — Human-editable, diffable, no DB ops for a personal tool.
3. **Shared schema module** — Single domain layer for CLI and UI.
4. **Dual loaders** — Vite glob for HMR; Node fs for standalone `yarn validate`.
5. **Read-only v0** — UI is explorer only; editing is "edit YAML, re-validate".
6. **Symmetric edges stored once** — `alternative_to` deduped by alphabetical `from`.

## Known v0 gaps

- `replaces` in schema but not in Graph Explorer filters or seed data
- `MigrationPathsPanel` component exists but is not mounted on any page

## Related docs

- `README.md` — quick start, data model summary
- `docs/DATA.md` — YAML authoring guide
