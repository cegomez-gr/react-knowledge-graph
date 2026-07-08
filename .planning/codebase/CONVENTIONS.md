# Coding Conventions

**Analysis Date:** 2026-07-08

## Repository State

This repository currently contains **no implemented source code**. It is a documentation-and-planning repo for extracting a reusable React knowledge-graph viewer (`@gruporeacciona/react-knowledge-graph`) from an existing internal project (`Codebase Memory MCP`). The only code-shaped artifacts are:

- `examples/basic-usage.tsx` — a single illustrative `.tsx` snippet, not a runnable package
- `examples/neutral-graph.schema.json` — a JSON Schema for the target data model
- `docs/*.md` and `docs/adr/*.md` — architecture, API, and decision documents that **prescribe** the conventions the future `packages/` monorepo must follow

There is no `tsconfig.json`, no ESLint/Prettier config, no test runner config, and no CI pipeline yet. `package.json` at the root only exposes placeholder scripts (`docs:check`, `licenses:check`) and declares no dependencies.

Everything below documents the conventions **specified in `docs/`** for the code that will be written. Treat this as the binding style guide for `/gsd:plan-phase` and `/gsd:execute-phase` when implementation begins — there is no existing code to contradict it.

## Naming Patterns

**Packages (planned monorepo, per `docs/03-architecture.md`):**
- kebab-case scoped npm packages: `graph-core`, `graph-renderer-three`, `react-knowledge-graph`, `adapters/codebase-memory`, `adapters/graphology`, `adapters/neo4j`
- Public package name: `@gruporeacciona/react-knowledge-graph`

**Types/Interfaces:**
- `PascalCase` for all exported types: `GraphNode`, `GraphEdge`, `NormalizedGraph`, `GraphNodeId`, `GraphEdgeId`, `KnowledgeGraphViewerProps`, `GraphLayoutOptions`, `GraphRenderOptions`, `GraphCameraOptions`, `GraphSelectionOptions`, `GraphInteractionOptions`, `GraphTheme`
- Options objects follow the pattern `Graph<Concern>Options` (`docs/05-react-api.md`)
- Generic type parameters use `T`-prefixed names for metadata payloads: `TMetadata` (`docs/04-data-model.md`)

**Components:**
- `PascalCase`, matching file name: `KnowledgeGraphViewer` (primary), `GraphInspector`, `GraphSearchBox`, `GraphLegend` (optional secondary panels, per `docs/05-react-api.md`)

**Hooks:**
- `camelCase` with `use` prefix, one hook per concern: `useGraphSelection`, `useGraphSearch`, `useGraphFilters`, `useGraphCamera`, `useGraphStats` (`docs/05-react-api.md`)

**Event handler props:**
- `on<Event>` naming: `onNodeClick`, `onNodeDoubleClick`, `onNodeHover`, `onEdgeClick`, `onSelectionChange` — always callbacks, never string event names

**Graph domain IDs:**
- Node/edge `id` values use a `kind:identifier` namespacing convention in examples: `repo:backend`, `file:auth.py`, `concept:jwt` (`examples/basic-usage.tsx`, `docs/04-data-model.md`). Follow this pattern for any new example or fixture data — it disambiguates entity kind directly in the ID string.

**Adapter functions:**
- `from<Source>` naming for functions converting an external format into the neutral model: `fromCodebaseMemoryGraph`, `fromNeo4jRecords`, `fromGraphology` (`docs/03-architecture.md`, `docs/06-extraction-plan.md`)

## Code Style

**Formatting/Linting tooling:** Not configured yet. `docs/06-extraction-plan.md` (Fase 0) requires adding, before any code import: lint, typecheck, tests, and a license check to CI. When implementing, install and configure these before writing package code — do not defer.

**Language:** TypeScript throughout, per ADR `docs/adr/0001-react-first.md` (React-first extraction) and the typed interfaces defined in `docs/04-data-model.md` and `docs/05-react-api.md`. No JavaScript-only files are specified anywhere in the design docs.

**Type shape conventions (from `docs/04-data-model.md`):**
- Use `interface` for the core domain shapes (`GraphNode`, `GraphEdge`, `NormalizedGraph`) since they represent extensible object shapes
- Use `type` for ID aliases (`export type GraphNodeId = string`)
- Generic defaults use `Record<string, unknown>` for open-ended metadata: `GraphNode<TMetadata = Record<string, unknown>>`
- Only `id`/`label` (nodes) and `source`/`target` (edges) are required; everything else is optional (`kind?`, `group?`, `weight?`, `icon?`, `color?`, `metadata?`)

```ts
export interface GraphNode<TMetadata = Record<string, unknown>> {
  id: GraphNodeId;
  label: string;
  kind?: string;
  group?: string;
  weight?: number;
  icon?: string;
  color?: string;
  metadata?: TMetadata;
}
```

**Component props shape (from `docs/05-react-api.md`):**
- A single flattened props interface for the primary component, grouping related options into nested option objects (`layout`, `camera`, `selection`, `interaction`, `render`) rather than dozens of top-level props
- Every callback prop returns the **normalized domain model**, never internal renderer objects

```ts
// Correct — normalized domain type
onNodeClick(node: GraphNode)

// Incorrect — leaks Three.js internals
onNodeClick(mesh: THREE.Mesh)
```

## Architectural / Layering Conventions

Per `docs/03-architecture.md`, enforce a strict one-directional dependency chain:

```
Application → react-knowledge-graph → graph-renderer-three → graph-core
```

- `graph-core` must have **zero** dependency on React or Three.js (pure types, validation, normalization, filtering/grouping utilities, stats)
- `graph-renderer-three` may depend on `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- `react-knowledge-graph` owns the public component, hooks, event wiring, theming, and optional panel layout
- `adapters/*` packages convert an external source format into `NormalizedGraph` and must **not** live inside the main React package (`docs/06-extraction-plan.md`, Fase 5)

**No internal data fetching (ADR `0003-no-internal-fetching.md`):**
- `KnowledgeGraphViewer` must never make HTTP calls or own a backend URL prop. All graph data enters via `nodes`/`edges` props.

```tsx
// Incorrect
<KnowledgeGraphViewer apiUrl="/api/graph" />

// Correct
<KnowledgeGraphViewer nodes={nodes} edges={edges} />
```

## Import Organization

Not yet enforced by tooling. Follow the general ECC TypeScript/React convention checked into `.claude/rules/ecc/typescript/coding-style.md` once code exists: framework imports first, then third-party, then absolute project imports, then relative; type-only imports kept separate (`import type { ... }`).

## Error Handling

No error-handling code exists yet. `docs/04-data-model.md` specifies the **validation contract** the `graph-core` package must implement before any rendering occurs:

- Node IDs must be unique
- Every edge's `source` and `target` must reference an existing node ID
- No empty-string IDs
- `edge.id` must be normalized/generated when not supplied by the caller
- Orphaned-node detection is optional but should be supported

When implementing `graph-core`, follow the ECC TypeScript error-handling pattern (narrow `unknown` in catch blocks, throw typed errors, never swallow validation failures silently) — see `.claude/rules/ecc/typescript/coding-style.md` and `.claude/rules/ecc/common/coding-style.md`.

## Data Validation

`examples/neutral-graph.schema.json` is the authoritative JSON Schema for the wire/data format (`$schema: 2020-12`). Key constraints to preserve in any TypeScript validator (e.g. Zod) built on top of it:

- `nodes` and `edges` are both required top-level arrays
- Each node requires `id` (`minLength: 1`) and `label`
- Each edge requires `source` and `target` (`minLength: 1`)
- Node/edge objects allow `additionalProperties: true` (open metadata), but the **top-level** `NormalizedGraph` object itself is `additionalProperties: false`

Per the ECC TypeScript rules, prefer Zod for runtime validation and infer static types from the schema rather than hand-maintaining both a TS interface and a separate JSON Schema long-term.

## Licensing / Attribution Conventions

Per `docs/02-feasibility.md` and `docs/06-extraction-plan.md`, when porting code from the original MIT-licensed `Codebase Memory MCP` project:
- Keep the initial import of original code in its own commit, separate from desacoplamiento (decoupling) and original-work commits, for license traceability
- Maintain `NOTICE.md` (already present at repo root) with attribution to the original project
- Add `THIRD_PARTY_NOTICES.md` generated from actual dependencies before publishing
- Run a license checker (`license-checker-rseidelsohn`, `pnpm licenses list`, or equivalent) in CI

## Comments / Documentation

- Design docs are written in **Spanish** (`docs/*.md`, `docs/adr/*.md`); code identifiers and examples are in **English**. Maintain this split when adding new docs vs. new code.
- ADRs follow a fixed structure: `## Estado` (status), `## Contexto` (context), `## Decisión` (decision), `## Consecuencias` (consequences, with Ventajas/Inconvenientes sub-bullets). Follow this exact structure for any new ADR under `docs/adr/NNNN-title.md`.

## Module Design

Per `docs/06-extraction-plan.md` and `docs/07-roadmap.md`, the target package boundaries are fixed early and should not be blurred during implementation:
- `graph-core`: types, validators, normalizers, filter/group utilities, stats
- `graph-renderer-three`: all Three.js/R3F rendering concerns
- `react-knowledge-graph`: public API surface (component + hooks + events + theming)
- `adapters/*`: one package per external data source, each exporting a single `from<Source>` normalizer function

---

*Convention analysis: 2026-07-08*
