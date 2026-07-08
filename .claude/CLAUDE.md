<!-- GSD:project-start source:PROJECT.md -->

## Project

**React Knowledge Graph Viewer**

Una librería React reutilizable (`@gruporeacciona/react-knowledge-graph`) para visualizar grafos de conocimiento — grafos de código, GraphRAG, Neo4j, Graphology/Sigma, memorias tipo Mem0/Graphiti, grafos jurídicos/documentales y mapas de dependencias técnicas — usando un modelo de datos neutral (`nodes: GraphNode[]`, `edges: GraphEdge[]`). Nace de extraer y evolucionar el visor 3D (Three.js / React Three Fiber) del proyecto open-source `codebase-memory-mcp` hacia un componente desacoplado de cualquier backend concreto.

**Core Value:** Cualquier equipo puede montar `<KnowledgeGraphViewer nodes={} edges={} />` para visualizar un grafo de conocimiento sin acoplarse a MCP, SQLite, ASTs, un repositorio Git concreto, ni a ningún backend específico.

### Constraints

- **Licencias**: intención de licencia MIT para el proyecto nuevo; debe mantener atribución a `codebase-memory-mcp` (copia de la licencia original, copyright, explicación en `NOTICE.md`) — Por qué: reutilizar código derivado bajo MIT exige atribución legal (docs/08).
- **Aprobación de publicación**: cualquier release público u open-source, o publicación npm bajo el scope `@gruporeacciona`, requiere aprobación interna previa según la política de conducta de Reacciona — Por qué: la organización no permite publicar contenido como Reacciona sin aprobación previa.
- **Stack técnico**: React primero, usando Three.js / React Three Fiber para el renderizado; JS vanilla explícitamente diferido — Por qué: el visor original está construido sobre R3F, reutilizarlo reduce el riesgo de la extracción (docs/01, docs/03).
- **Arquitectura**: modelo de datos neutral `nodes`/`edges`; el core (tipos, validación, normalización) debe permanecer desacoplado de cualquier renderizador o backend concreto (MCP, SQLite, AST, Git) — Por qué: reutilización across code graphs, GraphRAG, Neo4j, Graphology, KGs empresariales (docs/01, docs/03).
- **Política de dependencias**: nuevas dependencias deben respetar la política de licencias de docs/08 (MIT/BSD/ISC/Apache-2.0 permitidas por defecto; MPL/LGPL/EPL requieren revisión manual; GPL/AGPL/SSPL bloqueadas) — Por qué: mantener el paquete legalmente limpio dado el objetivo de licencia MIT.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Current Repository State

## Languages

- TypeScript - intended language for all future packages (`graph-core`, `graph-renderer-three`, `react-knowledge-graph`, adapters). Referenced throughout `docs/04-data-model.md` (`GraphNode`, `GraphEdge`, `NormalizedGraph` types) and `docs/05-react-api.md` (`KnowledgeGraphViewerProps`).
- TSX/JSX - for the React component layer, e.g. `examples/basic-usage.tsx`
- Markdown - all current repository content (`docs/*.md`, `README.md`, `NOTICE.md`, `SECURITY.md`)
- JSON - `examples/neutral-graph.schema.json` (JSON Schema draft 2020-12) and root `package.json`

## Runtime

- Node.js - version not pinned (no `.nvmrc`, no `engines` field in `package.json`)
- Not yet declared in the root `package.json` (no `packageManager` field)
- Docs consistently reference `pnpm` as the intended manager: `docs/06-extraction-plan.md` ("Crear monorepo con `pnpm` o `turbo`"), `docs/08-licensing-compliance.md` (`pnpm licenses list`, `pnpm audit`), root `package.json` script `licenses:check` ("Add pnpm licenses list once packages are implemented")
- Lockfile: **missing** (no `pnpm-lock.yaml`, `package-lock.json`, or `yarn.lock`)

## Frameworks (Planned)

- React - "React primero" per `docs/adr/0001-react-first.md`; first-phase library target
- Three.js - 3D rendering engine for the graph viewer, per `docs/02-feasibility.md` and `docs/03-architecture.md`
- React Three Fiber (`@react-three/fiber`) - React renderer for Three.js scenes, referenced in `docs/03-architecture.md` under `graph-renderer-three`
- `@react-three/drei` - R3F helper library, listed as a `graph-renderer-three` dependency in `docs/03-architecture.md`
- `@react-three/postprocessing` - visual effects (e.g. bloom, referenced via `enableBloom` in `docs/05-react-api.md` and `examples/basic-usage.tsx`)
- None configured yet. No test runner, config, or test files exist in the repository.
- Org-level TypeScript testing convention (`.claude/rules/ecc/typescript/testing.md`) recommends Playwright for E2E when implementation begins.
- Monorepo tooling: `pnpm` workspaces and/or `turbo`, per `docs/06-extraction-plan.md` ("Crear monorepo con `pnpm` o `turbo`")
- Storybook or Vite-based examples, per `docs/07-roadmap.md` Milestone 3 ("Añadir Storybook o Vite examples")
- ESM/CJS dual build target for npm publication, per `docs/07-roadmap.md` Milestone 7

## Key Dependencies

- `three` - core 3D rendering
- `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` - React/Three.js integration layer
- Adapter-specific optional dependencies referenced in `docs/03-architecture.md`:
- Sigma.js - proposed as a future optional 2D renderer, per `docs/07-roadmap.md` Milestone 8

## Configuration

- No environment variable usage detected. No `.env`, `.env.example` files present (though `.gitignore` reserves `.env`, `.env.*` and allows `!.env.example`).
- `docs/adr/0003-no-internal-fetching.md` establishes that the future `KnowledgeGraphViewer` component must not perform internal HTTP calls or hold backend/auth configuration — data enters purely via props (`nodes`, `edges`).
- No build config files exist yet (no `tsconfig.json`, `vite.config.*`, `tsup.config.*`, bundler config, ESLint/Prettier config).
- Root `package.json` scripts are placeholders:

## Platform Requirements

- Any environment capable of running Node.js and a Markdown viewer; no compiled toolchain is required to work with the repo today.
- Target: npm-publishable package, proposed name `@gruporeacciona/react-knowledge-graph` (see `README.md`), intended for internal/private registry or GitHub Packages publication per `docs/06-extraction-plan.md` Fase 7.

## Confidentiality Note

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Repository State

- `examples/basic-usage.tsx` — a single illustrative `.tsx` snippet, not a runnable package
- `examples/neutral-graph.schema.json` — a JSON Schema for the target data model
- `docs/*.md` and `docs/adr/*.md` — architecture, API, and decision documents that **prescribe** the conventions the future `packages/` monorepo must follow

## Naming Patterns

- kebab-case scoped npm packages: `graph-core`, `graph-renderer-three`, `react-knowledge-graph`, `adapters/codebase-memory`, `adapters/graphology`, `adapters/neo4j`
- Public package name: `@gruporeacciona/react-knowledge-graph`
- `PascalCase` for all exported types: `GraphNode`, `GraphEdge`, `NormalizedGraph`, `GraphNodeId`, `GraphEdgeId`, `KnowledgeGraphViewerProps`, `GraphLayoutOptions`, `GraphRenderOptions`, `GraphCameraOptions`, `GraphSelectionOptions`, `GraphInteractionOptions`, `GraphTheme`
- Options objects follow the pattern `Graph<Concern>Options` (`docs/05-react-api.md`)
- Generic type parameters use `T`-prefixed names for metadata payloads: `TMetadata` (`docs/04-data-model.md`)
- `PascalCase`, matching file name: `KnowledgeGraphViewer` (primary), `GraphInspector`, `GraphSearchBox`, `GraphLegend` (optional secondary panels, per `docs/05-react-api.md`)
- `camelCase` with `use` prefix, one hook per concern: `useGraphSelection`, `useGraphSearch`, `useGraphFilters`, `useGraphCamera`, `useGraphStats` (`docs/05-react-api.md`)
- `on<Event>` naming: `onNodeClick`, `onNodeDoubleClick`, `onNodeHover`, `onEdgeClick`, `onSelectionChange` — always callbacks, never string event names
- Node/edge `id` values use a `kind:identifier` namespacing convention in examples: `repo:backend`, `file:auth.py`, `concept:jwt` (`examples/basic-usage.tsx`, `docs/04-data-model.md`). Follow this pattern for any new example or fixture data — it disambiguates entity kind directly in the ID string.
- `from<Source>` naming for functions converting an external format into the neutral model: `fromCodebaseMemoryGraph`, `fromNeo4jRecords`, `fromGraphology` (`docs/03-architecture.md`, `docs/06-extraction-plan.md`)

## Code Style

- Use `interface` for the core domain shapes (`GraphNode`, `GraphEdge`, `NormalizedGraph`) since they represent extensible object shapes
- Use `type` for ID aliases (`export type GraphNodeId = string`)
- Generic defaults use `Record<string, unknown>` for open-ended metadata: `GraphNode<TMetadata = Record<string, unknown>>`
- Only `id`/`label` (nodes) and `source`/`target` (edges) are required; everything else is optional (`kind?`, `group?`, `weight?`, `icon?`, `color?`, `metadata?`)
- A single flattened props interface for the primary component, grouping related options into nested option objects (`layout`, `camera`, `selection`, `interaction`, `render`) rather than dozens of top-level props
- Every callback prop returns the **normalized domain model**, never internal renderer objects

## Architectural / Layering Conventions

- `graph-core` must have **zero** dependency on React or Three.js (pure types, validation, normalization, filtering/grouping utilities, stats)
- `graph-renderer-three` may depend on `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- `react-knowledge-graph` owns the public component, hooks, event wiring, theming, and optional panel layout
- `adapters/*` packages convert an external source format into `NormalizedGraph` and must **not** live inside the main React package (`docs/06-extraction-plan.md`, Fase 5)
- `KnowledgeGraphViewer` must never make HTTP calls or own a backend URL prop. All graph data enters via `nodes`/`edges` props.

## Import Organization

## Error Handling

- Node IDs must be unique
- Every edge's `source` and `target` must reference an existing node ID
- No empty-string IDs
- `edge.id` must be normalized/generated when not supplied by the caller
- Orphaned-node detection is optional but should be supported

## Data Validation

- `nodes` and `edges` are both required top-level arrays
- Each node requires `id` (`minLength: 1`) and `label`
- Each edge requires `source` and `target` (`minLength: 1`)
- Node/edge objects allow `additionalProperties: true` (open metadata), but the **top-level** `NormalizedGraph` object itself is `additionalProperties: false`

## Licensing / Attribution Conventions

- Keep the initial import of original code in its own commit, separate from desacoplamiento (decoupling) and original-work commits, for license traceability
- Maintain `NOTICE.md` (already present at repo root) with attribution to the original project
- Add `THIRD_PARTY_NOTICES.md` generated from actual dependencies before publishing
- Run a license checker (`license-checker-rseidelsohn`, `pnpm licenses list`, or equivalent) in CI

## Comments / Documentation

- Design docs are written in **Spanish** (`docs/*.md`, `docs/adr/*.md`); code identifiers and examples are in **English**. Maintain this split when adding new docs vs. new code.
- ADRs follow a fixed structure: `## Estado` (status), `## Contexto` (context), `## Decisión` (decision), `## Consecuencias` (consequences, with Ventajas/Inconvenientes sub-bullets). Follow this exact structure for any new ADR under `docs/adr/NNNN-title.md`.

## Module Design

- `graph-core`: types, validators, normalizers, filter/group utilities, stats
- `graph-renderer-three`: all Three.js/R3F rendering concerns
- `react-knowledge-graph`: public API surface (component + hooks + events + theming)
- `adapters/*`: one package per external data source, each exporting a single `from<Source>` normalizer function

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## Current Repository State

## System Overview (Target Architecture)

```text

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

- **React-first, not React-only long-term**: first implementation phase targets React explicitly (ADR 0001); a framework-agnostic/vanilla JS variant is an explicit non-goal for the initial phase (`docs/01-project-vision.md`).
- **Neutral data contract**: `NormalizedGraph { nodes: GraphNode[]; edges: GraphEdge[] }` is the only data format the viewer understands (`docs/04-data-model.md`).
- **No backend coupling**: the component never performs HTTP calls, never references MCP/SQLite/AST/Git internals (ADR 0003, `docs/01-project-vision.md` non-goals).
- **Monorepo of small, single-responsibility packages** rather than one large package (`docs/03-architecture.md`, `README.md`).
- **Pluggable renderer boundary**: `graph-renderer-three` is deliberately isolated so a future renderer (e.g., Sigma.js for 2D) could be swapped in (`docs/07-roadmap.md`, Milestone 8).

## Layers

- Purpose: define and validate the neutral graph model; provide pure utility functions
- Location: `packages/graph-core/` (planned)
- Contains: TypeScript types (`GraphNode`, `GraphEdge`, `NormalizedGraph`), validators, ID normalizers, filter/group/stat utilities
- Depends on: nothing (no React, no Three.js) — this is a hard constraint stated in `docs/03-architecture.md`
- Used by: `graph-renderer-three`, `react-knowledge-graph`, all `adapters/*`
- Purpose: turn a `NormalizedGraph` into a Three.js/R3F scene
- Location: `packages/graph-renderer-three/` (planned)
- Contains: scene setup, node/edge meshes, camera, controls, selection/hover logic, animations, visual effects (bloom, particles)
- Depends on: `graph-core`, `three`, optionally `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- Used by: `react-knowledge-graph`
- Note: `docs/03-architecture.md` flags a possible future split into `graph-renderer-three-core` + `graph-renderer-r3f`, deferred until needed (YAGNI)
- Purpose: expose the consumer-facing `KnowledgeGraphViewer` component and supporting hooks
- Location: `packages/react-knowledge-graph/` (planned)
- Contains: `KnowledgeGraphViewer`, `useGraphSelection`, `useGraphSearch`, `useGraphFilters`, `useGraphCamera`, `useGraphStats`, theming, optional panel components (`GraphInspector`, `GraphSearchBox`, `GraphLegend`)
- Depends on: `graph-core`, `graph-renderer-three`
- Used by: consuming applications directly (this is the published package entry point)
- Purpose: convert source-specific graph representations into `NormalizedGraph`
- Location: `packages/adapters/{codebase-memory,graphology,neo4j}/` (planned)
- Contains: pure conversion functions, e.g. `fromCodebaseMemory()`, `fromNeo4jRecords()`, `fromGraphology()`
- Depends on: `graph-core` (for target types)
- Used by: consuming applications, never imported by `react-knowledge-graph` itself — adapters sit outside the viewer's dependency graph by design (`docs/03-architecture.md`, `docs/06-extraction-plan.md` Fase 5)

## Data Flow

### Primary Rendering Path (target)

- Selection, search, filters, and camera state are intended to be exposed via dedicated hooks (`useGraphSelection`, `useGraphSearch`, `useGraphFilters`, `useGraphCamera`, `useGraphStats`) rather than a single monolithic internal store (`docs/05-react-api.md`)
- The viewer owns internal rendering state; the consuming app owns the source-of-truth graph data (passed in via props each render)

## Key Abstractions

- Purpose: single graph representation decoupled from any backend/source (Codebase Memory MCP, Neo4j, Graphology, GraphRAG, etc.)
- Defined in: `docs/04-data-model.md`, mirrored by JSON Schema in `examples/neutral-graph.schema.json`
- Shape:
- Required validations (`docs/04-data-model.md`): unique node IDs; edges reference existing `source`/`target`; no empty IDs; auto-generate `edge.id` when absent; optional orphan-node detection
- Purpose: one-way conversion from a specific external format to `NormalizedGraph`
- Examples (planned): `fromCodebaseMemory()`, `fromNeo4jRecords()`, `fromGraphology()` (`docs/03-architecture.md`)
- Pattern: pure functions, no side effects, live in their own packages under `packages/adapters/*`, never imported back into `react-knowledge-graph`
- Purpose: the single entry point/contract for consumers
- Defined in: `docs/05-react-api.md`
- Fields: `nodes`, `edges`, `theme`, `layout` (`GraphLayoutOptions`), `camera` (`GraphCameraOptions`), `selection` (`GraphSelectionOptions`), `interaction` (`GraphInteractionOptions`), `render` (`GraphRenderOptions`), event callbacks (`onNodeClick`, `onNodeDoubleClick`, `onNodeHover`, `onEdgeClick`, `onSelectionChange`), plus standard `className`/`style`

## Entry Points

- Location: `packages/react-knowledge-graph/` → exported as `@gruporeacciona/react-knowledge-graph`
- Triggers: imported by any consuming React application
- Responsibilities: expose `KnowledgeGraphViewer` and optional panel components/hooks; usage shown in `README.md` and `examples/basic-usage.tsx`
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

```tsx

```

### Leaking Three.js objects through the public API

```ts

```

### Importing adapters from the core viewer package

```ts

```

## Error Handling

- Fail fast with clear, actionable validation errors at the `graph-core` boundary before any Three.js work begins
- Untrusted `metadata` displayed in custom labels/tooltips/inspectors must be sanitized by the consumer or by the library before rendering as HTML (`SECURITY.md`) — avoid rendering arbitrary HTML by default

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| agent-introspection-debugging | Structured self-debugging workflow for AI agent failures using capture, diagnosis, contained recovery, and introspection reports. | `.claude/skills/agent-introspection-debugging/SKILL.md` |
| agent-sort | Build an evidence-backed ECC install plan for a specific repo by sorting skills, commands, rules, hooks, and extras into DAILY vs LIBRARY buckets using parallel repo-aware review passes. Use when ECC should be trimmed to what a project actually needs instead of loading the full bundle. | `.claude/skills/agent-sort/SKILL.md` |
| api-design | REST API design patterns including resource naming, status codes, pagination, filtering, error responses, versioning, and rate limiting for production APIs. | `.claude/skills/api-design/SKILL.md` |
| article-writing | Write articles, guides, blog posts, tutorials, newsletter issues, and other long-form content in a distinctive voice derived from supplied examples or brand guidance. Use when the user wants polished written content longer than a paragraph, especially when voice consistency, structure, and credibility matter. | `.claude/skills/article-writing/SKILL.md` |
| backend-patterns | Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, and Next.js API routes. | `.claude/skills/backend-patterns/SKILL.md` |
| benchmark-methodology | >- Use after competitive-platform-analysis has produced a tiered competitor set. Scores each competitor across nine weighted dimensions (positioning, voice, visual craft, offer packaging, evidence, enterprise-readiness, thought leadership, pricing, client's strategic tension) with explicit 1–5 rubrics and a tension-plot. Precedes competitive-report-structure. | `.claude/skills/benchmark-methodology/SKILL.md` |
| brand-discovery | >- Use when a brand needs to discover or articulate its identity through structured multi-session interviews. Covers purpose, positioning, audience, personality, voice, narrative, and founder-brand tension across 8 modules using laddering, 5 Whys, and projective techniques. Produces a resumable session with disk-persisted state and a master brandbook (90_SYNTHESIS.md). | `.claude/skills/brand-discovery/SKILL.md` |
| brand-voice | Build a source-derived writing style profile from real posts, essays, launch notes, docs, or site copy, then reuse that profile across content, outreach, and social workflows. Use when the user wants voice consistency without generic AI writing tropes. | `.claude/skills/brand-voice/SKILL.md` |
| bun-runtime | Bun as runtime, package manager, bundler, and test runner. When to choose Bun vs Node, migration notes, and Vercel support. | `.claude/skills/bun-runtime/SKILL.md` |
| coding-standards | Baseline cross-project coding conventions for naming, readability, immutability, and code-quality review. Use detailed frontend or backend skills for framework-specific patterns. | `.claude/skills/coding-standards/SKILL.md` |
| competitive-platform-analysis | >- Use when scoping a competitive landscape — identifying, categorising, and score-filtering a competitor set before any benchmarking begins. Decides who counts as a competitor, which tier they belong to, and which sources to mine. First step in the three-skill competitive pipeline; precedes benchmark-methodology. | `.claude/skills/competitive-platform-analysis/SKILL.md` |
| competitive-report-structure | >- Use after benchmark-methodology has produced scored competitor profile cards. Assembles findings into a decision-grade report: landscape map, competitor profiles, benchmarking matrix, white-space analysis, strategic recommendations, and team alignment trigger questions. Final step in the three-skill competitive pipeline. | `.claude/skills/competitive-report-structure/SKILL.md` |
| content-engine | Create platform-native content systems for X, LinkedIn, TikTok, YouTube, newsletters, and repurposed multi-platform campaigns. Use when the user wants social posts, threads, scripts, content calendars, or one source asset adapted cleanly across platforms. | `.claude/skills/content-engine/SKILL.md` |
| continuous-learning-v2 | Instinct-based learning system that observes sessions via hooks, creates atomic instincts with confidence scoring, and evolves them into skills/commands/agents. v2.1 adds project-scoped instincts to prevent cross-project contamination. | `.claude/skills/continuous-learning-v2/SKILL.md` |
| crosspost | Multi-platform content distribution across X, LinkedIn, Threads, and Bluesky. Adapts content per platform using content-engine patterns. Never posts identical content cross-platform. Use when the user wants to distribute content across social platforms. | `.claude/skills/crosspost/SKILL.md` |
| deep-research | Multi-source deep research using firecrawl and exa MCPs. Searches the web, synthesizes findings, and delivers cited reports with source attribution. Use when the user wants thorough research on any topic with evidence and citations. | `.claude/skills/deep-research/SKILL.md` |
| dmux-workflows | Multi-agent orchestration using dmux (tmux pane manager for AI agents). Patterns for parallel agent workflows across Claude Code, Codex, OpenCode, and other harnesses. Use when running multiple agent sessions in parallel or coordinating multi-agent development workflows. | `.claude/skills/dmux-workflows/SKILL.md` |
| documentation-lookup | Use up-to-date library and framework docs via Context7 MCP instead of training data. Activates for setup questions, API references, code examples, or when the user names a framework (e.g. React, Next.js, Prisma). | `.claude/skills/documentation-lookup/SKILL.md` |
| e2e-testing | Playwright E2E testing patterns, Page Object Model, configuration, CI/CD integration, artifact management, and flaky test strategies. | `.claude/skills/e2e-testing/SKILL.md` |
| eval-harness | Formal evaluation framework for Claude Code sessions implementing eval-driven development (EDD) principles | `.claude/skills/eval-harness/SKILL.md` |
| everything-claude-code | Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits. | `.claude/skills/everything-claude-code/SKILL.md` |
| exa-search | Neural search via Exa MCP for web, code, and company research. Use when the user needs web search, code examples, company intel, people lookup, or AI-powered deep research with Exa's neural search engine. | `.claude/skills/exa-search/SKILL.md` |
| fal-ai-media | Unified media generation via fal.ai MCP — image, video, and audio. Covers text-to-image (Nano Banana), text/image-to-video (Seedance, Kling, Veo 3), text-to-speech (CSM-1B), and video-to-audio (ThinkSound). Use when the user wants to generate images, videos, or audio with AI. | `.claude/skills/fal-ai-media/SKILL.md` |
| frontend-patterns | Frontend development patterns for React, Next.js, state management, performance optimization, and UI best practices. | `.claude/skills/frontend-patterns/SKILL.md` |
| frontend-slides | Create stunning, animation-rich HTML presentations from scratch or by converting PowerPoint files. Use when the user wants to build a presentation, convert a PPT/PPTX to web, or create slides for a talk/pitch. Helps non-designers discover their aesthetic through visual exploration rather than abstract choices. | `.claude/skills/frontend-slides/SKILL.md` |
| investor-materials | Create and update pitch decks, one-pagers, investor memos, accelerator applications, financial models, and fundraising materials. Use when the user needs investor-facing documents, projections, use-of-funds tables, milestone plans, or materials that must stay internally consistent across multiple fundraising assets. | `.claude/skills/investor-materials/SKILL.md` |
| investor-outreach | Draft cold emails, warm intro blurbs, follow-ups, update emails, and investor communications for fundraising. Use when the user wants outreach to angels, VCs, strategic investors, or accelerators and needs concise, personalized, investor-facing messaging. | `.claude/skills/investor-outreach/SKILL.md` |
| iterative-retrieval | Pattern for progressively refining context retrieval to solve the subagent context problem | `.claude/skills/iterative-retrieval/SKILL.md` |
| market-research | Conduct market research, competitive analysis, investor due diligence, and industry intelligence with source attribution and decision-oriented summaries. Use when the user wants market sizing, competitor comparisons, fund research, technology scans, or research that informs business decisions. | `.claude/skills/market-research/SKILL.md` |
| mcp-server-patterns | Build MCP servers with Node/TypeScript SDK — tools, resources, prompts, Zod validation, stdio vs Streamable HTTP. Use Context7 or official MCP docs for latest API. | `.claude/skills/mcp-server-patterns/SKILL.md` |
| mle-workflow | Production machine-learning engineering workflow for data contracts, reproducible training, model evaluation, deployment, monitoring, and rollback. Use when building, reviewing, or hardening ML systems beyond one-off notebooks. | `.claude/skills/mle-workflow/SKILL.md` |
| nextjs-turbopack | Next.js 16+ and Turbopack — incremental bundling, FS caching, dev speed, and when to use Turbopack vs webpack. | `.claude/skills/nextjs-turbopack/SKILL.md` |
| product-capability | Translate PRD intent, roadmap asks, or product discussions into an implementation-ready capability plan that exposes constraints, invariants, interfaces, and unresolved decisions before multi-service work starts. Use when the user needs an ECC-native PRD-to-SRS lane instead of vague planning prose. | `.claude/skills/product-capability/SKILL.md` |
| search-first | Research-before-coding workflow. Search for existing tools, libraries, and patterns before writing custom code. Invokes the researcher agent. | `.claude/skills/search-first/SKILL.md` |
| security-review | Use this skill when adding authentication, handling user input, working with secrets, creating API endpoints, or implementing payment/sensitive features. Provides comprehensive security checklist and patterns. | `.claude/skills/security-review/SKILL.md` |
| strategic-compact | Suggests manual context compaction at logical intervals to preserve context through task phases rather than arbitrary auto-compaction. | `.claude/skills/strategic-compact/SKILL.md` |
| tdd-workflow | Use this skill when writing new features, fixing bugs, or refactoring code. Enforces test-driven development with 80%+ coverage including unit, integration, and E2E tests. | `.claude/skills/tdd-workflow/SKILL.md` |
| verification-loop | "A comprehensive verification system for Claude Code sessions." | `.claude/skills/verification-loop/SKILL.md` |
| video-editing | AI-assisted video editing workflows for cutting, structuring, and augmenting real footage. Covers the full pipeline from raw capture through FFmpeg, Remotion, ElevenLabs, fal.ai, and final polish in Descript or CapCut. Use when the user wants to edit video, cut footage, create vlogs, or build video content. | `.claude/skills/video-editing/SKILL.md` |
| x-api | X/Twitter API integration for posting tweets, threads, reading timelines, search, and analytics. Covers OAuth auth patterns, rate limits, and platform-native content posting. Use when the user wants to interact with X programmatically. | `.claude/skills/x-api/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
