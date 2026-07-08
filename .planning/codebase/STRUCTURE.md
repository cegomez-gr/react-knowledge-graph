# Codebase Structure

**Analysis Date:** 2026-07-08

## Current State Notice

This repository is currently **documentation-only**. `packages/` exists as an empty directory. There is no `src/`, no bundler config, no `tsconfig.json`, no lockfile, and no test runner configured. The layout below documents (a) what physically exists today and (b) the target monorepo layout specified in `README.md` and `docs/03-architecture.md`, which future implementation work should follow.

## Directory Layout (Current, Actual)

```
react-knowledge-graph/
├── .claude/                    # Claude Code project config (rules, skills — tooling, not product code)
├── .git/
├── .planning/
│   └── codebase/                # Codebase mapper output (this file and ARCHITECTURE.md)
├── docs/                        # Numbered design documents (the actual deliverable so far)
│   ├── 01-project-vision.md
│   ├── 02-feasibility.md
│   ├── 03-architecture.md
│   ├── 04-data-model.md
│   ├── 05-react-api.md
│   ├── 06-extraction-plan.md
│   ├── 07-roadmap.md
│   ├── 08-licensing-compliance.md
│   └── adr/                     # Architecture Decision Records
│       ├── 0001-react-first.md
│       ├── 0002-neutral-graph-model.md
│       └── 0003-no-internal-fetching.md
├── examples/                    # Illustrative-only, not runnable (no build/deps wired yet)
│   ├── basic-usage.tsx           # Sample consumer usage of the (not-yet-built) public API
│   └── neutral-graph.schema.json # JSON Schema for NormalizedGraph, for external tooling/validation
├── packages/                     # EMPTY — placeholder for the future monorepo packages
├── LICENSE
├── NOTICE.md                     # MIT attribution notice for Codebase Memory MCP provenance
├── SECURITY.md
├── package.json                  # Root manifest; only stub scripts (docs:check, licenses:check)
├── .gitignore
└── README.md                     # Project overview, target npm package usage example, doc index
```

## Directory Layout (Target Monorepo, Specified but Not Yet Created)

Per `README.md` ("Estructura propuesta del futuro monorepo") and `docs/03-architecture.md`:

```
packages/
  graph-core/                       # Pure types/validation/utilities — no React, no Three.js
  graph-renderer-three/             # Three.js/R3F scene, camera, controls, effects
  react-knowledge-graph/            # Public component + hooks (the published package)
  adapters/
    codebase-memory/                # fromCodebaseMemory() adapter
    graphology/                     # fromGraphology() adapter
    neo4j/                          # fromNeo4jRecords() adapter
examples/
  basic-react/                      # Planned: minimal React demo app
  codebase-memory-adapter/          # Planned: demo using the Codebase Memory adapter
  large-graph/                      # Planned: performance/stress demo (1k–10k nodes, per docs/07-roadmap.md)
docs/
```

When scaffolding begins, create these directories exactly as named above — the naming is a documented decision, not a suggestion, and downstream docs (`docs/06-extraction-plan.md` phases, `docs/07-roadmap.md` milestones) reference these exact package names.

## Directory Purposes

**`docs/`:**
- Purpose: numbered, sequential design/decision documentation — read in order 01 → 08 for full context
- Contains: vision, legal/technical feasibility, architecture, data model, public API spec, extraction plan from the original MCP viewer, roadmap, licensing/compliance policy
- Key files: `docs/03-architecture.md` (layering + package boundaries), `docs/04-data-model.md` (the `NormalizedGraph` contract), `docs/06-extraction-plan.md` (phase-by-phase extraction checklist)

**`docs/adr/`:**
- Purpose: immutable-once-accepted architecture decision records; each is one focused decision with Context/Decision/Consequences
- Contains: `0001-react-first.md`, `0002-neutral-graph-model.md`, `0003-no-internal-fetching.md`
- Naming: `NNNN-kebab-case-title.md`, zero-padded 4-digit sequence — follow this exactly for any new ADR (next one is `0004-*.md`)

**`examples/`:**
- Purpose: illustrate the intended consumer-facing API and data shape before any package is implemented
- Contains: `basic-usage.tsx` (a `.tsx` snippet assuming the future `@gruporeacciona/react-knowledge-graph` package exists — currently not compilable/runnable stand-alone since there's no build setup or dependency on the package), `neutral-graph.schema.json` (formal JSON Schema mirroring `docs/04-data-model.md`'s TypeScript types)
- Generated: No. Committed: Yes.

**`packages/`:**
- Purpose: reserved location for the future monorepo packages (`graph-core`, `graph-renderer-three`, `react-knowledge-graph`, `adapters/*`)
- Currently: empty directory, tracked implicitly (no `.gitkeep` observed — verify before assuming it's tracked by git)

**`.claude/`:**
- Purpose: Claude Code tooling configuration for this repo (rules under `.claude/rules/ecc/`, skills under `.claude/skills/`) — not part of the shipped product, do not treat as application code when reasoning about the library's own architecture

**`.planning/codebase/`:**
- Purpose: output location for codebase-mapper documents (this file, `ARCHITECTURE.md`, and others produced by future mapping runs)

## Key File Locations

**Entry Points (current):**
- `README.md`: project overview, target public API shape, links to all docs

**Entry Points (planned, once implemented):**
- `packages/react-knowledge-graph/src/index.ts` (or equivalent): would export `KnowledgeGraphViewer` and hooks — exact path not yet created

**Configuration:**
- `package.json` (root): only placeholder scripts (`docs:check`, `licenses:check`), both currently `echo` stubs — no real build/lint/test tooling wired yet
- `.gitignore`: anticipates future tooling — ignores `node_modules/`, `dist/`, `build/`, `coverage/`, `.env*`, `.claude/settings.json`

**Core Logic (specification, not code):**
- `docs/04-data-model.md`: canonical `GraphNode`/`GraphEdge`/`NormalizedGraph` type definitions to implement in `graph-core`
- `docs/05-react-api.md`: canonical `KnowledgeGraphViewerProps` and hook signatures to implement in `react-knowledge-graph`
- `examples/neutral-graph.schema.json`: canonical JSON Schema counterpart of the data model, useful for runtime validation or contract tests once `graph-core` exists

**Compliance / Legal:**
- `LICENSE`: project's own license
- `NOTICE.md`: MIT attribution placeholder for ported Codebase Memory MCP code — must be finalized with exact upstream repo URL/copyright/license text before any code import (per its own instructions)
- `docs/08-licensing-compliance.md`: dependency license policy (allowed/review/blocked lists)

## Naming Conventions

**Files:**
- Documentation: `NN-kebab-case-title.md`, two-digit zero-padded sequence (`01-project-vision.md` … `08-licensing-compliance.md`)
- ADRs: `NNNN-kebab-case-title.md`, four-digit zero-padded sequence, under `docs/adr/`
- Examples: descriptive kebab-case matching content (`basic-usage.tsx`, `neutral-graph.schema.json`)

**Directories:**
- Package names are kebab-case, scoped conceptually by layer: `graph-core`, `graph-renderer-three`, `react-knowledge-graph`
- Adapters are grouped under a shared `adapters/` parent, one subdirectory per source system (`codebase-memory`, `graphology`, `neo4j`) — follow this pattern for any new adapter (e.g., a future GraphRAG adapter would be `packages/adapters/graphrag/`)

**Types/Interfaces (per `docs/04-data-model.md`, to apply once code exists):**
- Exported types: `PascalCase` (`GraphNode`, `GraphEdge`, `NormalizedGraph`, `KnowledgeGraphViewerProps`, `GraphLayoutOptions`, `GraphRenderOptions`)
- ID type aliases: `PascalCase` with `Id` suffix (`GraphNodeId`, `GraphEdgeId`)
- Public component: `PascalCase`, matches file name once created (`KnowledgeGraphViewer`)
- Hooks: `camelCase` with `use` prefix (`useGraphSelection`, `useGraphSearch`, `useGraphFilters`, `useGraphCamera`, `useGraphStats`)
- Event props: `on`-prefixed (`onNodeClick`, `onNodeDoubleClick`, `onNodeHover`, `onEdgeClick`, `onSelectionChange`) — see `.claude/rules/ecc/react/coding-style.md` project convention, which matches the docs already

## Where to Add New Code

**New design document:**
- Add to `docs/` as the next zero-padded number in sequence (currently next is `09-*.md`); add a link to it in `README.md`'s documentation index

**New ADR:**
- Add to `docs/adr/` as `0004-kebab-case-title.md`, following the Estado/Contexto/Decisión/Consecuencias structure used by the existing three

**New package (when implementation starts):**
- Core types/logic with zero framework deps → `packages/graph-core/`
- Rendering logic tied to Three.js/R3F → `packages/graph-renderer-three/`
- Public React component/hooks → `packages/react-knowledge-graph/`
- Source-format conversion → `packages/adapters/<source-name>/`
- Do not add new top-level packages outside this structure without a corresponding ADR — the layering is a deliberate, documented decision (ADR 0001, ADR 0002, ADR 0003)

**New example/demo:**
- Add under `examples/`, matching the planned subfolder names from `README.md` (`basic-react/`, `codebase-memory-adapter/`, `large-graph/`) once those are scaffolded; until then, flat `.tsx`/`.json` files at `examples/` root (as with the two existing files) are acceptable

**New adapter:**
- New directory under `packages/adapters/<source>/`, exposing a single conversion function named `from<Source>(...)`, returning `NormalizedGraph` — never imported by `react-knowledge-graph` itself (see ARCHITECTURE.md anti-patterns)

## Special Directories

**`packages/`:**
- Purpose: reserved for the future monorepo packages
- Generated: No
- Committed: Yes (currently empty)

**`.claude/`:**
- Purpose: Claude Code harness configuration (rules, skills) for working in this repo
- Generated: Partially (skills bundle is a vendored/installed skill set)
- Committed: Yes (per current git status, untracked but present)

**`.planning/codebase/`:**
- Purpose: codebase-mapper output documents (this file and siblings)
- Generated: Yes, by `/gsd:map-codebase` and related tooling
- Committed: Typically yes, to keep the docs in sync with the repo for future planning runs

---

*Structure analysis: 2026-07-08*
