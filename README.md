# Isomorph

Map tools to responsibilities, not syntax.

Personal knowledge graph for concept-first skill transfer: technologies, frameworks, and ecosystems mapped to stable responsibilities with typed relationships.

## v0 scope

Validation cluster seed data:

- Responsibilities: validation, serialization
- Technologies: Pydantic, Zod, Joi, Marshmallow, class-validator
- Ecosystems: FastAPI, Django, Node.js, NestJS

## Quick start

```bash
yarn install
yarn validate   # validate YAML graph data
yarn dev        # start UI at http://localhost:5173
yarn build      # validate + production build
```

## App pages

- `/` Home (search + browse lists)
- `/graph` Graph explorer (filters + click-through)
- `/compare` Compare two technologies
- `/relationships` Relationship types guide
- `/technology/:id`, `/responsibility/:id`, `/ecosystem/:id` Node detail pages

## Project structure

```
data/           YAML source of truth (nodes + relationships)
schema/         Zod schemas + graph query helpers
scripts/        CLI tools (validate)
src/            React UI
```

## Data model

Three node types:

- **responsibility** — stable system role (ORM, validation, routing)
- **technology** — concrete tool (Pydantic, SQLAlchemy)
- **ecosystem** — common groupings (FastAPI stack, Node.js)

Relationship types:

| Type | Direction | Example |
|------|-----------|---------|
| `fulfills` | technology → responsibility | pydantic → validation |
| `alternative_to` | technology ↔ technology | pydantic ↔ zod |
| `commonly_paired` | technology → technology | — |
| `belongs_to` | technology → ecosystem | pydantic → fastapi |
| `depends_on` | technology → technology | — |

Store `alternative_to` once with `from` alphabetically before `to`.

## Adding data

1. Add a YAML file under `data/responsibilities/`, `data/technologies/`, or `data/ecosystems/`
2. Add edges in `data/relationships.yaml`
3. Run `yarn validate`

See [docs/DATA.md](docs/DATA.md) for file templates.

## Dev notes

- Edits to `src/` hot-reload via Vite.
- Graph YAML edits under `data/` are picked up automatically during `yarn dev` (the graph reloads in dev).

## Scripts

| Command | Description |
|---------|-------------|
| `yarn validate` | Validate graph schema and relationship rules |
| `yarn dev` | Vite dev server |
| `yarn build` | Validate then build static site |
| `yarn lint` | ESLint |
