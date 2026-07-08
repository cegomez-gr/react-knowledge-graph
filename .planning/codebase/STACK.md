# Technology Stack

**Analysis Date:** 2026-07-08

## Current Repository State

This repository is **documentation-only**. There is no implementation source code yet (no `packages/*` code, no `src/`, no build output). The single `package.json` at the repo root is a placeholder for the docs repo itself, not for the future library. All frameworks, libraries, and package layout described below are **planned/proposed** per `docs/03-architecture.md`, `docs/02-feasibility.md`, and `docs/07-roadmap.md` — not yet installed or configured. Treat this document as "intended stack" rather than "stack in use."

## Languages

**Primary (planned):**
- TypeScript - intended language for all future packages (`graph-core`, `graph-renderer-three`, `react-knowledge-graph`, adapters). Referenced throughout `docs/04-data-model.md` (`GraphNode`, `GraphEdge`, `NormalizedGraph` types) and `docs/05-react-api.md` (`KnowledgeGraphViewerProps`).
- TSX/JSX - for the React component layer, e.g. `examples/basic-usage.tsx`

**Current (actual):**
- Markdown - all current repository content (`docs/*.md`, `README.md`, `NOTICE.md`, `SECURITY.md`)
- JSON - `examples/neutral-graph.schema.json` (JSON Schema draft 2020-12) and root `package.json`

## Runtime

**Environment:**
- Node.js - version not pinned (no `.nvmrc`, no `engines` field in `package.json`)

**Package Manager:**
- Not yet declared in the root `package.json` (no `packageManager` field)
- Docs consistently reference `pnpm` as the intended manager: `docs/06-extraction-plan.md` ("Crear monorepo con `pnpm` o `turbo`"), `docs/08-licensing-compliance.md` (`pnpm licenses list`, `pnpm audit`), root `package.json` script `licenses:check` ("Add pnpm licenses list once packages are implemented")
- Lockfile: **missing** (no `pnpm-lock.yaml`, `package-lock.json`, or `yarn.lock`)

## Frameworks (Planned)

**Core (planned):**
- React - "React primero" per `docs/adr/0001-react-first.md`; first-phase library target
- Three.js - 3D rendering engine for the graph viewer, per `docs/02-feasibility.md` and `docs/03-architecture.md`
- React Three Fiber (`@react-three/fiber`) - React renderer for Three.js scenes, referenced in `docs/03-architecture.md` under `graph-renderer-three`
- `@react-three/drei` - R3F helper library, listed as a `graph-renderer-three` dependency in `docs/03-architecture.md`
- `@react-three/postprocessing` - visual effects (e.g. bloom, referenced via `enableBloom` in `docs/05-react-api.md` and `examples/basic-usage.tsx`)

**Testing (planned):**
- None configured yet. No test runner, config, or test files exist in the repository.
- Org-level TypeScript testing convention (`.claude/rules/ecc/typescript/testing.md`) recommends Playwright for E2E when implementation begins.

**Build/Dev (planned):**
- Monorepo tooling: `pnpm` workspaces and/or `turbo`, per `docs/06-extraction-plan.md` ("Crear monorepo con `pnpm` o `turbo`")
- Storybook or Vite-based examples, per `docs/07-roadmap.md` Milestone 3 ("Añadir Storybook o Vite examples")
- ESM/CJS dual build target for npm publication, per `docs/07-roadmap.md` Milestone 7

## Key Dependencies

**Critical (planned, not yet installed):**
- `three` - core 3D rendering
- `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` - React/Three.js integration layer

**Infrastructure (planned):**
- Adapter-specific optional dependencies referenced in `docs/03-architecture.md`:
  - Graph database client(s) for a future Neo4j adapter (`fromNeo4jRecords`)
  - `graphology` for a future Graphology adapter (`fromGraphology`)
- Sigma.js - proposed as a future optional 2D renderer, per `docs/07-roadmap.md` Milestone 8

## Configuration

**Environment:**
- No environment variable usage detected. No `.env`, `.env.example` files present (though `.gitignore` reserves `.env`, `.env.*` and allows `!.env.example`).
- `docs/adr/0003-no-internal-fetching.md` establishes that the future `KnowledgeGraphViewer` component must not perform internal HTTP calls or hold backend/auth configuration — data enters purely via props (`nodes`, `edges`).

**Build:**
- No build config files exist yet (no `tsconfig.json`, `vite.config.*`, `tsup.config.*`, bundler config, ESLint/Prettier config).
- Root `package.json` scripts are placeholders:
  - `docs:check` → `echo 'Markdown docs repository - no build yet'`
  - `licenses:check` → `echo 'Add pnpm licenses list once packages are implemented'`

## Platform Requirements

**Development:**
- Any environment capable of running Node.js and a Markdown viewer; no compiled toolchain is required to work with the repo today.

**Production:**
- Target: npm-publishable package, proposed name `@gruporeacciona/react-knowledge-graph` (see `README.md`), intended for internal/private registry or GitHub Packages publication per `docs/06-extraction-plan.md` Fase 7.

## Confidentiality Note

This repo does not currently contain secrets, credentials, or environment files. If future implementation work introduces API keys, database connection strings, or other credentials (e.g. for a Neo4j adapter), store them via environment variables or a secret manager per `.claude/rules/ecc/common/security.md` and never commit them — confidential configuration must stay within Grupo Reacciona's authorized channels.

---

*Stack analysis: 2026-07-08*
