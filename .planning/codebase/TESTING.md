# Testing Patterns

**Analysis Date:** 2026-07-08

## Current State

**No test framework is installed or configured in this repository.** There are no `*.test.*` / `*.spec.*` files, no `jest.config.*`, `vitest.config.*`, or `playwright.config.*`, and the root `package.json` defines no `test` script (only placeholder `docs:check` and `licenses:check` scripts). This is expected: the repo is currently documentation-only (`docs/`, `docs/adr/`, one non-runnable `examples/basic-usage.tsx` snippet, and a JSON Schema). No `packages/` implementation exists yet to test.

This document captures the **testing plan and requirements specified in the project's own docs** (`docs/06-extraction-plan.md`, `docs/07-roadmap.md`) so that `/gsd:plan-phase` and `/gsd:execute-phase` set up testing correctly from the first implementation phase, rather than retrofitting it later.

## Required Test Framework Setup (per `docs/06-extraction-plan.md`, Fase 0)

Before any code is imported from the source project, the plan explicitly requires adding a CI pipeline with:
- lint
- typecheck
- **tests**
- license check

This means test infrastructure (runner + CI wiring) must exist **before** the first package (`graph-core`) is scaffolded, not after.

**Recommended runner:** Not specified in the docs. Given the TypeScript/React/Vite-oriented stack described in `docs/02-feasibility.md` and `docs/03-architecture.md` (React, Three.js, React Three Fiber, Drei, Postprocessing), and the ECC TypeScript testing rule (`.claude/rules/ecc/typescript/testing.md`) mandating **Playwright** for E2E, the natural choices when implementation starts are:
- **Vitest** for unit/integration tests of `graph-core` (pure TS, no DOM dependency) and `react-knowledge-graph` (with `@testing-library/react` for component-level tests)
- **Playwright** for E2E tests once `examples/` becomes a runnable app (per ECC TypeScript testing rule)

Confirm/finalize this choice during the first implementation phase's planning step — it is not yet locked in by any doc in this repo.

## What Must Be Tested Per Package (derived from `docs/03-architecture.md` responsibilities)

**`graph-core`** (pure logic, no React/Three.js dependency — easiest and highest-priority to unit test):
- Node/edge validation rules from `docs/04-data-model.md`:
  - Rejects duplicate node IDs
  - Rejects edges whose `source`/`target` do not reference an existing node
  - Rejects empty-string IDs
  - Auto-normalizes/generates `edge.id` when omitted
  - Correctly flags orphaned nodes (optional check)
- ID normalization utilities
- Filtering utilities (by `kind`, `group`)
- Grouping utilities
- Basic graph statistics calculations

**`graph-renderer-three`:**
- Scene/camera/control setup — likely covered by integration or visual/E2E tests rather than pure unit tests, given Three.js's imperative, canvas-based nature
- Selection and hover state transitions

**`react-knowledge-graph`:**
- Component contract: verify `KnowledgeGraphViewer` renders given `nodes`/`edges` props and performs **no internal HTTP fetch** (this is a testable architectural invariant from ADR `0003-no-internal-fetching.md` — a test should assert no network calls occur when mounting the component with local data)
- All callback props (`onNodeClick`, `onNodeDoubleClick`, `onNodeHover`, `onEdgeClick`, `onSelectionChange`) fire with the **normalized domain model** (`GraphNode`/`GraphEdge`), never a raw Three.js `Mesh` or internal renderer object — this is an explicit correctness rule from `docs/05-react-api.md` and should be asserted directly in tests
- Custom hooks (`useGraphSelection`, `useGraphSearch`, `useGraphFilters`, `useGraphCamera`, `useGraphStats`) tested independently of the full component tree

**`adapters/*`:**
- Each `from<Source>` function (`fromCodebaseMemoryGraph`, `fromNeo4jRecords`, `fromGraphology`) needs input/output fixture tests confirming the result validates against the `NormalizedGraph` schema in `examples/neutral-graph.schema.json`

## Performance Testing (Milestone 5, `docs/07-roadmap.md`)

The roadmap explicitly calls for **benchmark tests**, not just correctness tests, once the core viewer exists:
- Load and render tests at 1k, 5k, and 10k node scale
- Verify label-display strategy (hover/selection-only) does not regress at scale
- Edge-simplification and level-of-detail behavior under load

Track these as a distinct benchmark suite (e.g. `packages/graph-renderer-three/bench/`), separate from correctness unit tests, since they measure timing/frame-rate rather than pass/fail assertions.

## Test Data / Fixtures

Two ready-to-use fixtures already exist in the repo and should be the seed for the first test fixtures once a runner is configured:
- `examples/basic-usage.tsx` — minimal 3-node/2-edge graph (`repo:backend`, `file:auth.py`, `concept:jwt`) demonstrating the `kind:identifier` ID convention
- `examples/neutral-graph.schema.json` — the JSON Schema that any fixture or adapter output must satisfy; use this directly for schema-conformance tests (e.g. via `ajv` or a Zod schema derived from it)

## Validation Contract to Test First

Because `docs/04-data-model.md` treats data validation as a first-class responsibility of `graph-core`, the very first tests written for this project (once implementation starts) should be validation tests, following AAA structure per the ECC common testing rule:

```typescript
test('rejects edge referencing a non-existent target node', () => {
  // Arrange
  const nodes = [{ id: 'a', label: 'A' }];
  const edges = [{ source: 'a', target: 'missing' }];

  // Act
  const result = validateGraph({ nodes, edges });

  // Assert
  expect(result.valid).toBe(false);
});
```

## Coverage Target

No project-specific target is stated in `docs/`. Apply the org-wide default from `.claude/rules/ecc/common/testing.md`: **80% minimum coverage**, covering unit (per-package logic), integration (adapter-to-`graph-core` boundary, component-to-hook wiring), and E2E (critical flows in `examples/` once they become runnable apps) test types.

## CI Integration

Per `docs/06-extraction-plan.md` Fase 0, tests must run in CI alongside lint, typecheck, and the license check — all four gates should block merges from the very first implementation PR, not be added incrementally afterward.

---

*Testing analysis: 2026-07-08*
