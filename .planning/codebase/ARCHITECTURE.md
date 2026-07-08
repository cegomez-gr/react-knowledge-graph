<!-- refreshed: 2026-07-08 -->
# Architecture

**Analysis Date:** 2026-07-08

## Current Repository State

**IMPORTANT:** As of this analysis, `react-knowledge-graph` contains **no implementation code**. It is a documentation-only repository (`packages/` exists but is empty; there is no `src/`, no build tooling, no `tsconfig.json`, no test runner). The architecture described below is the **specified target architecture** captured in `docs/03-architecture.md`, `docs/04-data-model.md`, `docs/05-react-api.md`, `docs/06-extraction-plan.md`, and the ADRs in `docs/adr/`. Any future implementation phase should treat these documents as the binding design contract, not as historical description.

The project's stated purpose (`README.md`): extract and generalize the 3D graph viewer from `Codebase Memory MCP` (MIT licensed) into a standalone, reusable npm package `@gruporeacciona/react-knowledge-graph` for visualizing knowledge graphs, code graphs, and semantic memories.

## System Overview (Target Architecture)

```text
┌─────────────────────────────────────────────────────────────┐
│                       Consuming Application                  │
│         (passes `nodes` + `edges` as props — no fetching)    │
└──────────────────────────┬────────────────────────────────────┘
                           │ props: { nodes, edges, theme, layout, ... }
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              react-knowledge-graph (public package)          │
│  `packages/react-knowledge-graph/`                            │
│  - <KnowledgeGraphViewer /> component                         │
│  - hooks: useGraphSelection, useGraphSearch, useGraphFilters, │
│    useGraphCamera, useGraphStats                              │
│  - theming, panel components (Inspector/SearchBox/Legend)     │
└──────────────────────────┬────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                graph-renderer-three (renderer adapter)        │
│  `packages/graph-renderer-three/`                              │
│  - Three.js / R3F scene, camera, controls                     │
│  - node/edge rendering, selection, hover, animations           │
└──────────────────────────┬────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       graph-core (pure logic)                │
│  `packages/graph-core/`                                        │
│  - GraphNode / GraphEdge / NormalizedGraph types               │
│  - validation, ID normalization, filtering, grouping,           │
│    basic statistics — NO React, NO Three.js dependency          │
└─────────────────────────────────────────────────────────────┘

              ▲ (feeds NormalizedGraph into the stack above)
              │
┌─────────────────────────────────────────────────────────────┐
│                          adapters/*                            │
│  `packages/adapters/codebase-memory/`                           │
│  `packages/adapters/graphology/`                                │
│  `packages/adapters/neo4j/`                                     │
│  Each converts a source-specific format to NormalizedGraph.     │
│  Adapters are external to the core/react/renderer packages.     │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File / Planned Path |
|-----------|----------------|------|
| `graph-core` | Types, validation, ID normalization, filtering/grouping utilities, stats — framework-agnostic | `packages/graph-core/` (planned) |
| `graph-renderer-three` | Three.js/R3F scene: node/edge placement, camera, controls, selection, hover, animation, visual effects | `packages/graph-renderer-three/` (planned) |
| `react-knowledge-graph` | Public `KnowledgeGraphViewer` component, hooks, event wiring, theming, optional panels | `packages/react-knowledge-graph/` (planned) |
| `adapters/codebase-memory` | Converts Codebase Memory MCP's internal graph format to `NormalizedGraph` | `packages/adapters/codebase-memory/` (planned) |
| `adapters/graphology` | Converts Graphology graphs to `NormalizedGraph` | `packages/adapters/graphology/` (planned) |
| `adapters/neo4j` | Converts Neo4j query records to `NormalizedGraph` | `packages/adapters/neo4j/` (planned) |
| Documentation set | Vision, feasibility, architecture, data model, API, extraction plan, roadmap, licensing | `docs/01-project-vision.md` … `docs/08-licensing-compliance.md` |
| ADRs | Recorded binding decisions | `docs/adr/0001-react-first.md`, `docs/adr/0002-neutral-graph-model.md`, `docs/adr/0003-no-internal-fetching.md` |

## Pattern Overview

**Overall:** Layered library architecture with strict dependency direction (renderer/UI depends on core; core depends on nothing). Data enters via props only — no internal data fetching (see ADR 0003). Multiple source formats are normalized via the **Adapter pattern** into one neutral graph model (see ADR 0002) before reaching the viewer.

**Key Characteristics:**
- **React-first, not React-only long-term**: first implementation phase targets React explicitly (ADR 0001); a framework-agnostic/vanilla JS variant is an explicit non-goal for the initial phase (`docs/01-project-vision.md`).
- **Neutral data contract**: `NormalizedGraph { nodes: GraphNode[]; edges: GraphEdge[] }` is the only data format the viewer understands (`docs/04-data-model.md`).
- **No backend coupling**: the component never performs HTTP calls, never references MCP/SQLite/AST/Git internals (ADR 0003, `docs/01-project-vision.md` non-goals).
- **Monorepo of small, single-responsibility packages** rather than one large package (`docs/03-architecture.md`, `README.md`).
- **Pluggable renderer boundary**: `graph-renderer-three` is deliberately isolated so a future renderer (e.g., Sigma.js for 2D) could be swapped in (`docs/07-roadmap.md`, Milestone 8).

## Layers

**`graph-core` (data/logic layer):**
- Purpose: define and validate the neutral graph model; provide pure utility functions
- Location: `packages/graph-core/` (planned)
- Contains: TypeScript types (`GraphNode`, `GraphEdge`, `NormalizedGraph`), validators, ID normalizers, filter/group/stat utilities
- Depends on: nothing (no React, no Three.js) — this is a hard constraint stated in `docs/03-architecture.md`
- Used by: `graph-renderer-three`, `react-knowledge-graph`, all `adapters/*`

**`graph-renderer-three` (rendering layer):**
- Purpose: turn a `NormalizedGraph` into a Three.js/R3F scene
- Location: `packages/graph-renderer-three/` (planned)
- Contains: scene setup, node/edge meshes, camera, controls, selection/hover logic, animations, visual effects (bloom, particles)
- Depends on: `graph-core`, `three`, optionally `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- Used by: `react-knowledge-graph`
- Note: `docs/03-architecture.md` flags a possible future split into `graph-renderer-three-core` + `graph-renderer-r3f`, deferred until needed (YAGNI)

**`react-knowledge-graph` (public API layer):**
- Purpose: expose the consumer-facing `KnowledgeGraphViewer` component and supporting hooks
- Location: `packages/react-knowledge-graph/` (planned)
- Contains: `KnowledgeGraphViewer`, `useGraphSelection`, `useGraphSearch`, `useGraphFilters`, `useGraphCamera`, `useGraphStats`, theming, optional panel components (`GraphInspector`, `GraphSearchBox`, `GraphLegend`)
- Depends on: `graph-core`, `graph-renderer-three`
- Used by: consuming applications directly (this is the published package entry point)

**`adapters/*` (integration layer):**
- Purpose: convert source-specific graph representations into `NormalizedGraph`
- Location: `packages/adapters/{codebase-memory,graphology,neo4j}/` (planned)
- Contains: pure conversion functions, e.g. `fromCodebaseMemory()`, `fromNeo4jRecords()`, `fromGraphology()`
- Depends on: `graph-core` (for target types)
- Used by: consuming applications, never imported by `react-knowledge-graph` itself — adapters sit outside the viewer's dependency graph by design (`docs/03-architecture.md`, `docs/06-extraction-plan.md` Fase 5)

## Data Flow

### Primary Rendering Path (target)

1. Consuming application obtains graph data from any source (backend, file, graph DB) — outside the library's responsibility
2. If the source isn't already neutral, an adapter converts it: `fromCodebaseMemory(originalGraph)` → `NormalizedGraph` (`docs/03-architecture.md`, `docs/06-extraction-plan.md`)
3. Application renders `<KnowledgeGraphViewer nodes={nodes} edges={edges} .../>` — data enters exclusively via props (ADR 0003)
4. `react-knowledge-graph` validates/normalizes via `graph-core` utilities
5. `graph-renderer-three` builds the Three.js scene from the normalized data and layout/render options
6. User interaction (click/hover/select) is captured by the renderer, translated back into `GraphNode`/`GraphEdge` domain objects, and surfaced through callback props (`onNodeClick`, `onNodeHover`, `onEdgeClick`, `onSelectionChange`) — **never** raw Three.js objects (`docs/05-react-api.md`: "Eventos deben devolver siempre el objeto normalizado, no estructuras internas de Three.js")

**State Management:**
- Selection, search, filters, and camera state are intended to be exposed via dedicated hooks (`useGraphSelection`, `useGraphSearch`, `useGraphFilters`, `useGraphCamera`, `useGraphStats`) rather than a single monolithic internal store (`docs/05-react-api.md`)
- The viewer owns internal rendering state; the consuming app owns the source-of-truth graph data (passed in via props each render)

## Key Abstractions

**`NormalizedGraph` (neutral data model):**
- Purpose: single graph representation decoupled from any backend/source (Codebase Memory MCP, Neo4j, Graphology, GraphRAG, etc.)
- Defined in: `docs/04-data-model.md`, mirrored by JSON Schema in `examples/neutral-graph.schema.json`
- Shape:
  ```ts
  export interface GraphNode<TMetadata = Record<string, unknown>> {
    id: GraphNodeId;      // required, unique
    label: string;        // required
    kind?: string;        // semantic type: file, class, concept, person, document
    group?: string;
    weight?: number;
    icon?: string;
    color?: string;
    metadata?: TMetadata;
  }

  export interface GraphEdge<TMetadata = Record<string, unknown>> {
    id?: GraphEdgeId;
    source: GraphNodeId;  // required
    target: GraphNodeId;  // required
    label?: string;
    kind?: string;
    weight?: number;
    directed?: boolean;
    color?: string;
    metadata?: TMetadata;
  }

  export interface NormalizedGraph<N = Record<string, unknown>, E = Record<string, unknown>> {
    nodes: GraphNode<N>[];
    edges: GraphEdge<E>[];
  }
  ```
- Required validations (`docs/04-data-model.md`): unique node IDs; edges reference existing `source`/`target`; no empty IDs; auto-generate `edge.id` when absent; optional orphan-node detection

**Adapter functions:**
- Purpose: one-way conversion from a specific external format to `NormalizedGraph`
- Examples (planned): `fromCodebaseMemory()`, `fromNeo4jRecords()`, `fromGraphology()` (`docs/03-architecture.md`)
- Pattern: pure functions, no side effects, live in their own packages under `packages/adapters/*`, never imported back into `react-knowledge-graph`

**`KnowledgeGraphViewerProps` (public component contract):**
- Purpose: the single entry point/contract for consumers
- Defined in: `docs/05-react-api.md`
- Fields: `nodes`, `edges`, `theme`, `layout` (`GraphLayoutOptions`), `camera` (`GraphCameraOptions`), `selection` (`GraphSelectionOptions`), `interaction` (`GraphInteractionOptions`), `render` (`GraphRenderOptions`), event callbacks (`onNodeClick`, `onNodeDoubleClick`, `onNodeHover`, `onEdgeClick`, `onSelectionChange`), plus standard `className`/`style`

## Entry Points

**Public package entry point (planned):**
- Location: `packages/react-knowledge-graph/` → exported as `@gruporeacciona/react-knowledge-graph`
- Triggers: imported by any consuming React application
- Responsibilities: expose `KnowledgeGraphViewer` and optional panel components/hooks; usage shown in `README.md` and `examples/basic-usage.tsx`

**Documentation entry point (current):**
- Location: `README.md`
- Responsibilities: project overview, expected npm package shape, links into `docs/`, proposed future monorepo layout

## Architectural Constraints

- **No implementation exists yet.** There is no build system, bundler, package manager lockfile, or `tsconfig.json` in the repo. `package.json` at the root only wires placeholder `docs:check` / `licenses:check` scripts (`echo` stubs) — treat any "run tests"/"run build" request as not yet applicable until packages are scaffolded.
- **Strict dependency direction (mandatory):** `graph-core` must never depend on React or Three.js (`docs/03-architecture.md`, explicit). Violating this in a future implementation is an architecture regression, not a style nit.
- **No internal data fetching (mandatory, ADR 0003):** `KnowledgeGraphViewer` must never make HTTP calls or accept a URL/endpoint prop. Data must always arrive as `nodes`/`edges` props.
- **No MCP/backend coupling (mandatory, project non-goal):** the React package must not reference MCP, SQLite, ASTs, or Git repositories directly — those concerns belong exclusively in `adapters/*`.
- **License provenance constraint:** any code ported from `Codebase Memory MCP` (MIT licensed) must land in a clearly separated commit for traceability (`docs/02-feasibility.md`, `docs/06-extraction-plan.md` Fase 1) and must preserve MIT attribution (`NOTICE.md`).
- **Global state:** none exists yet; when implemented, prefer hook-scoped state (`useGraphSelection` etc.) over any module-level singleton, to keep multiple `KnowledgeGraphViewer` instances independent.

## Anti-Patterns

### Fetching data inside the viewer component

**What happens:** A future contributor adds `apiUrl` prop or an internal `fetch()`/`useEffect` data-loading call to `KnowledgeGraphViewer`.
**Why it's wrong:** Violates ADR 0003 and couples the library to transport/auth/backend specifics, defeating the entire purpose of the neutral-model extraction.
**Do this instead:** Keep `KnowledgeGraphViewer` a pure, props-in/callbacks-out component. Data loading and adapter conversion happen in the consuming application, illustrated in `docs/03-architecture.md`:
```tsx
// Incorrect
<KnowledgeGraphViewer apiUrl="/api/graph" />

// Correct
<KnowledgeGraphViewer nodes={nodes} edges={edges} />
```

### Leaking Three.js objects through the public API

**What happens:** An event handler returns a `THREE.Mesh` or internal scene object instead of the normalized domain object.
**Why it's wrong:** Breaks the renderer-swap goal (`graph-renderer-three` should be replaceable) and forces every consumer to understand Three.js internals.
**Do this instead:** Always translate to `GraphNode`/`GraphEdge` before invoking callback props (`docs/05-react-api.md`):
```ts
// Incorrect
onNodeClick(mesh: THREE.Mesh)

// Correct
onNodeClick(node: GraphNode)
```

### Importing adapters from the core viewer package

**What happens:** `react-knowledge-graph` imports `packages/adapters/codebase-memory` directly to offer a "convenience" all-in-one import.
**Why it's wrong:** Re-introduces the exact backend coupling the extraction plan (`docs/06-extraction-plan.md`, Fase 5) explicitly forbids, and pulls MCP-specific dependencies into a general-purpose package.
**Do this instead:** Keep adapters as separate, opt-in packages the consumer imports and composes explicitly:
```ts
import { fromCodebaseMemory } from '@gruporeacciona/graph-adapter-codebase-memory';
```

## Error Handling

**Strategy (specified, not yet implemented):** `graph-core` is responsible for validating incoming graph data before it reaches the renderer — unique node IDs, valid edge references, non-empty IDs, auto-generated edge IDs, optional orphan-node checks (`docs/04-data-model.md`). No implementation of validators exists yet; this is a requirement for the first `graph-core` implementation phase.

**Patterns (to establish during implementation):**
- Fail fast with clear, actionable validation errors at the `graph-core` boundary before any Three.js work begins
- Untrusted `metadata` displayed in custom labels/tooltips/inspectors must be sanitized by the consumer or by the library before rendering as HTML (`SECURITY.md`) — avoid rendering arbitrary HTML by default

## Cross-Cutting Concerns

**Logging:** Not yet defined — no implementation exists.
**Validation:** Centralized in `graph-core` per `docs/04-data-model.md`; JSON Schema reference available at `examples/neutral-graph.schema.json` for external/tooling validation.
**Theming:** Owned by `react-knowledge-graph` (`theme?: 'light' | 'dark' | GraphTheme` prop, `docs/05-react-api.md`), not by `graph-core` or the renderer package directly.
**Licensing/attribution:** Cross-cutting compliance concern — see `docs/08-licensing-compliance.md` and `NOTICE.md`; any commit importing code from Codebase Memory MCP must stay isolated and attributed.

---

*Architecture analysis: 2026-07-08*
