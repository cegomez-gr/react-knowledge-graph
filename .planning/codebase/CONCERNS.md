# Codebase Concerns

**Analysis Date:** 2026-07-08

## Project Stage Context

This repository currently contains **documentation only** — no implementation code exists yet. `packages/` is an empty directory, and the only executable-looking files are two illustrative examples (`examples/basic-usage.tsx`, `examples/neutral-graph.schema.json`) that reference a package (`@gruporeacciona/react-knowledge-graph`) which has not been created. All findings below reflect the state of a **pre-implementation planning repo**, not a mature codebase. Most "concerns" here are gaps to close before Milestone 2 (per `docs/07-roadmap.md`) rather than defects in shipped code.

## Tech Debt

**No monorepo tooling configured yet:**
- Issue: `docs/06-extraction-plan.md` (Phase 0) and `README.md` describe a planned `packages/` monorepo (`graph-core`, `graph-renderer-three`, `react-knowledge-graph`, `adapters/*`), but no workspace tooling (`pnpm-workspace.yaml`, `turbo.json`, `nx.json`) exists.
- Files: `package.json` (root), `packages/` (empty)
- Impact: Any implementation work has no scaffold to land in; first contributor will need to make monorepo-structure decisions ad hoc, risking drift from the documented plan.
- Fix approach: Create the workspace config and empty package skeletons (with `package.json` + `tsconfig.json` stubs) before writing implementation code, per `docs/06-extraction-plan.md` Fase 0.

**`package.json` scripts are placeholders:**
- Issue: `docs:check` and `licenses:check` scripts in `package.json` just `echo` messages instead of running real checks (e.g., markdown lint, `pnpm licenses list`).
- Files: `package.json:6-9`
- Impact: CI referenced in `docs/02-feasibility.md` and `docs/08-licensing-compliance.md` ("lint; typecheck; tests; license check") is not actually implemented — any claim of enforced license/compliance checks in docs is aspirational, not real.
- Fix approach: Wire `docs:check` to a real markdown linter (e.g., `markdownlint-cli2`) and `licenses:check` to `pnpm licenses list` / `license-checker-rseidelsohn` once dependencies exist.

**No CI pipeline exists:**
- Issue: No `.github/workflows/` directory or equivalent CI config present, despite docs mandating lint/typecheck/tests/license-check gates.
- Files: none (absence noted at repo root)
- Impact: Nothing currently prevents a future PR from merging code with GPL/AGPL-licensed dependencies, missing attribution, or failing tests — directly contradicting the compliance strategy in `docs/08-licensing-compliance.md`.
- Fix approach: Add a CI workflow before or alongside Milestone 2 implementation work, not after.

## Known Bugs

Not applicable — no runtime code exists yet to exhibit bugs.

## Security Considerations

**No sanitization implementation for untrusted graph metadata:**
- Risk: `SECURITY.md` states "Consumers should sanitize untrusted metadata before displaying it in custom labels, tooltips or inspectors" and "The core viewer should avoid rendering arbitrary HTML by default" — but this is a stated intent, not an enforced mechanism, since no viewer code exists.
- Files: `SECURITY.md:11-15`, `docs/05-react-api.md` (props like `GraphInspector`, custom label renderers)
- Current mitigation: Documentation only.
- Recommendations: When implementing `KnowledgeGraphViewer` and `GraphInspector`, ensure any user-supplied `label`, `metadata`, or custom render functions are never passed through `dangerouslySetInnerHTML` without sanitization (see React security rules: audit every `dangerouslySetInnerHTML` call site). Bake this into the `graph-core` validation layer described in `docs/03-architecture.md` rather than leaving it to each consumer.

**Schema does not constrain `metadata` shape:**
- Risk: `examples/neutral-graph.schema.json:20` and `:39` define `metadata` as an unconstrained `"type": "object"` with implicit `additionalProperties: true` on nodes/edges. Combined with `NormalizedGraph`'s generic `TMetadata = Record<string, unknown>` in `docs/04-data-model.md:9,20`, arbitrary consumer-controlled data can flow deep into the render layer.
- Files: `examples/neutral-graph.schema.json`, `docs/04-data-model.md:9-30`
- Recommendation: When adapters and the core validator are implemented, treat `metadata` as untrusted by default and require explicit opt-in / sanitization before any renderer displays it as HTML or interpolates it into DOM attributes.

## Performance Bottlenecks

**No performance validation exists for stated scale targets:**
- Problem: `docs/07-roadmap.md` (Milestone 5) commits to testing with "1k, 5k y 10k nodos" and implementing "Level of detail" and label-density strategies, but no renderer, benchmark harness, or performance budget exists yet.
- Files: `docs/07-roadmap.md:32-38`, `docs/05-react-api.md:52-61` (`GraphRenderOptions.enableBloom`, `enableParticles` — expensive Three.js post-processing features called out with no gating strategy)
- Cause: Feature not yet built.
- Improvement path: When `graph-renderer-three` is implemented, establish a benchmark suite (per Milestone 5) before enabling bloom/particles by default, since post-processing effects in Three.js/R3F are typically the first thing to blow frame budget at 5k+ nodes.

## Fragile Areas

Not applicable — no implementation exists to be fragile. The primary latent fragility is architectural drift risk: `docs/03-architecture.md`'s "Decisión clave" (no internal HTTP/API fetching inside `KnowledgeGraphViewer`, data enters only via props) is a hard constraint that must be enforced by convention/lint rule once code exists, since nothing currently prevents a future contributor from reintroducing `apiUrl`-style props (ADR 0003, `docs/adr/0003-no-internal-fetching.md`).

## Scaling Limits

Not applicable at this stage — see Performance Bottlenecks for the stated (but unvalidated) 10k-node target.

## Dependencies at Risk

**No actual dependencies declared yet, but license policy needs enforcement tooling:**
- Risk: `docs/08-licensing-compliance.md` defines an allow/review/block list (MIT/BSD/ISC/Apache-2.0 allowed; MPL/LGPL/EPL manual review; GPL/AGPL/SSPL blocked), but `package.json` has zero dependencies and no automated license-checker is wired in.
- Impact: Once `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` and other real dependencies are added (per `docs/02-feasibility.md`), there is no automated gate to catch a transitively-pulled GPL/AGPL package before it lands in a commit.
- Migration plan: Add `license-checker-rseidelsohn` (or `pnpm licenses list` wired into CI) as part of Fase 0 of `docs/06-extraction-plan.md`, before any dependency is added — not retrofitted after the fact.

**Unresolved provenance of the "Codebase Memory MCP" source material:**
- Risk: `NOTICE.md:14` explicitly says: "Before publishing, replace this notice with the exact upstream repository URL, copyright holder and license text from the specific revision used." This has not been done — the NOTICE currently contains only a template/placeholder attribution.
- Files: `NOTICE.md`, `docs/02-feasibility.md:16-38` (legal risk section), `docs/08-licensing-compliance.md:12-26`
- Impact: If code is imported from Codebase Memory MCP before this notice is finalized with the real upstream URL/copyright/license text, the repo would be out of compliance with its own documented policy (`docs/02-feasibility.md` Mitigación #2, #5: keep import/refactor/original-work commits separate for traceability).
- Migration plan: Before Fase 1 ("Importación controlada") of `docs/06-extraction-plan.md` begins, finalize `NOTICE.md` with concrete upstream details and create the separate "initial import" commit called for in the mitigation plan.

## Missing Critical Features

**No `THIRD_PARTY_NOTICES.md`:**
- Problem: `docs/02-feasibility.md:32` and `docs/08-licensing-compliance.md:33` both list `THIRD_PARTY_NOTICES.md` as a required file, but it does not exist in the repo root.
- Blocks: Cannot truthfully claim license compliance readiness for publication (Milestone 7, `docs/07-roadmap.md:47-53`) without this file, since it is meant to be generated from real dependencies which don't exist yet — but its absence should be tracked as a checklist item, not silently forgotten once dependencies land.

**No `graph-core` validation implementation:**
- Problem: `docs/04-data-model.md:94-102` specifies concrete validation rules (unique node IDs, edges referencing existing nodes, no empty IDs, edge ID normalization, orphan-node detection) that are core to the "Core sin UI" principle (`docs/01-project-vision.md:32`), but no code implements them.
- Blocks: Every downstream package (`react-knowledge-graph`, adapters) depends on this validation layer existing first, per the layering in `docs/03-architecture.md:1-13`.

**No repository-level `.claude/settings.json` committed (per `.gitignore`):**
- Note: `.gitignore:7` excludes `.claude/settings.json`, which is expected/intentional (local tool config), not a defect — flagged only for completeness since it affects what a fresh clone will and won't have configured locally.

## Test Coverage Gaps

**Zero tests exist anywhere in the repo:**
- What's not tested: Everything — there is no test runner, no test config, and no test files, because there is no implementation code yet.
- Files: N/A (absence noted at repo root; no `*.test.*`/`*.spec.*` files, no `vitest.config.*`/`jest.config.*`)
- Risk: The organization's testing rules (`.claude/rules/ecc/common/testing.md`) mandate 80% coverage and TDD (write test first) for all future work. Because this project is still pre-code, there is a window to set up the test harness (Vitest/Jest + Playwright per `.claude/rules/ecc/typescript/testing.md`) as part of Milestone 1/2 infrastructure, before the first line of `graph-core` or `react-knowledge-graph` logic is written, to avoid retrofitting tests onto untested code later.
- Priority: High — should be resolved as part of the Milestone 1/2 scaffolding work, before feature code lands, per the TDD workflow mandated in org rules.

**No CI-enforced typecheck/lint despite TypeScript being the stated language:**
- What's not tested: No `tsconfig.json`, `.eslintrc*`, or `.prettierrc*` exist anywhere in the repo, even though all code examples (`docs/04-data-model.md`, `docs/05-react-api.md`, `examples/basic-usage.tsx`) are written in TypeScript/TSX.
- Files: repo root (absence noted)
- Risk: Without a shared `tsconfig.json`/lint config checked in now, each package created later risks inconsistent strictness settings (e.g., `strict: true` vs. loose), directly undermining the "Avoid `any`" and explicit-typing rules in the org's TypeScript coding-style rules.
- Priority: High — should land with the monorepo scaffold (Milestone 1) alongside workspace tooling.

---

*Concerns audit: 2026-07-08*
