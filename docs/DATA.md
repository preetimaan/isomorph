# Data guide

YAML files in `data/` are the source of truth. Edit files directly — no in-app CRUD in v0.

## Node file template

```yaml
id: my-tool
type: technology
name: My Tool
description: One-line summary of what it does.
tags:
  - python
  - backend
maturity: learning # optional: learning | comfortable | expert
notes: Personal tradeoff notes.
sources:
  - https://example.com/docs
```

## Relationship rules

- `fulfills`: technology → responsibility
- `alternative_to`: technology → technology (store once, `from` < `to` alphabetically)
- `commonly_paired`: technology → technology
- `belongs_to`: technology → ecosystem
- `depends_on`: technology → technology
- `replaces`: technology → technology (migration path)

## Validate before commit

```bash
yarn validate
```

Checks:

- Zod schema compliance
- No duplicate or orphan IDs
- Correct edge direction by node type
- Symmetric edge storage rules
