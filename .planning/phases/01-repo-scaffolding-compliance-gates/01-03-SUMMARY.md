---
phase: 01-repo-scaffolding-compliance-gates
plan: 03
subsystem: infra
tags: [typescript, pnpm-workspace, turborepo, eslint, graph-core]

# Dependency graph
requires:
  - phase: 01-repo-scaffolding-compliance-gates
    provides: "pnpm/Turborepo/TypeScript monorepo root scaffolding (Plan 01-01) and the four-block ESLint architecture-boundary guard + CI license gate + finalized NOTICE.md (Plan 01-02)"
provides:
  - "packages/graph-core/package.json — @gruporeacciona/graph-core, zero react/react-dom/three/@react-three/* dependencies declared"
  - "packages/graph-core/tsconfig.json — extends tsconfig.base.json, composite, no jsx, zero upstream project references (dependency root of the package graph)"
  - "packages/graph-core/src/index.ts — placeholder entry point, buildable via tsc --build / turbo run build"
  - "Empirical proof that the D-05 ESLint block (Plan 01-02) actually fires: both a disallowed `react` import and a disallowed bare `fetch(...)` global were shown to fail lint with the expected rule IDs, then reverted"
affects: [01-04-graph-renderer-three, 01-05-react-knowledge-graph, 01-06-adapters-codebase-memory, 01-07-examples-skeleton, 01-08-verification-slice]

# Tech tracking
tech-stack:
  added: []
  patterns: ["graph-core as the zero-dependency root of the TypeScript project-reference graph — every other package will reference it, it references nothing"]

key-files:
  created: [packages/graph-core/package.json, packages/graph-core/tsconfig.json, packages/graph-core/src/index.ts]
  modified: [.gitignore, pnpm-lock.yaml]

key-decisions:
  - "Added .turbo/ to .gitignore — the turbo build cache directory was generated as a direct side effect of this plan's own Task 1 verification (`turbo run build`) and would otherwise have been left as an untracked generated artifact (Rule 3 hygiene, not scope creep)."

requirements-completed: [INFRA-01, INFRA-02, INFRA-03]

coverage:
  - id: D1
    description: "packages/graph-core/package.json declares zero dependencies on react/react-dom/three/@react-three/* and builds cleanly via `turbo run build --filter=@gruporeacciona/graph-core` using TypeScript project references"
    requirement: "INFRA-01"
    verification:
      - kind: unit
        ref: "pnpm exec turbo run build --filter=@gruporeacciona/graph-core (manual command invocation)"
        status: pass
      - kind: unit
        ref: "grep -E '\"(react|react-dom|three|@react-three/[a-z-]+)\"' packages/graph-core/package.json returns no match (manual command invocation)"
        status: pass
    human_judgment: false
  - id: D2
    description: "TypeScript project references resolve: packages/graph-core/tsconfig.json extends ../../tsconfig.base.json, has zero upstream references, and tsc --build (via turbo) succeeds with real dist/ output"
    requirement: "INFRA-02"
    verification:
      - kind: unit
        ref: "pnpm exec turbo run build --filter=@gruporeacciona/graph-core; ls packages/graph-core/dist/ shows index.js, index.d.ts, .tsbuildinfo (manual command invocation)"
        status: pass
    human_judgment: false
  - id: D3
    description: "D-05 ESLint architecture guard (Plan 01-02) empirically fires against graph-core: a throwaway `import 'react'` fails lint with no-restricted-imports naming 'react'; a throwaway bare `fetch(...)` fails lint with no-restricted-globals naming 'fetch'; both were reverted and the final state passes lint clean"
    requirement: "INFRA-03"
    verification:
      - kind: unit
        ref: "pnpm exec eslint packages/graph-core with temporary `import 'react';` — exit 1, ruleId no-restricted-imports, message \"'react' import is restricted from being used.\" (manual command invocation)"
        status: pass
      - kind: unit
        ref: "pnpm exec eslint packages/graph-core with temporary `fetch('http://example.com');` — exit 1, ruleId no-restricted-globals, message \"Unexpected use of 'fetch'. No internal fetching (ADR 0003).\" (manual command invocation)"
        status: pass
      - kind: unit
        ref: "pnpm exec eslint packages/graph-core on final reverted src/index.ts — exit 0, 'ESLint: No issues found' (manual command invocation)"
        status: pass
    human_judgment: false

duration: ~10min
completed: 2026-07-08
status: complete
---

# Phase 1 Plan 3: graph-core Package Scaffolding + D-05 Guard Verification Summary

**`packages/graph-core` scaffolded as a real, buildable TypeScript package with zero React/Three/backend dependencies, and the Plan 01-02 ESLint architecture guard empirically proven to block both a `react` import and a bare `fetch()` call against it.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-07-08T12:33:13Z (approx., per STATE.md `last_updated` at phase start)
- **Completed:** 2026-07-08T12:43:00Z (approx.)
- **Tasks:** 2 (both auto)
- **Files modified:** 5 (3 created: package.json, tsconfig.json, src/index.ts; 2 modified: .gitignore, pnpm-lock.yaml)

## Accomplishments
- `packages/graph-core/package.json` created: `@gruporeacciona/graph-core`, `version: 0.0.0`, `private: true`, `type: module`, `main`/`types` pointing at `./dist`, `build`/`lint`/`typecheck` scripts — zero `react`/`react-dom`/`three`/`@react-three/*` keys anywhere in the file (confirmed via grep)
- `packages/graph-core/tsconfig.json` created extending `../../tsconfig.base.json`, with `outDir`/`rootDir`/`tsBuildInfoFile` under `./dist`, `include: ["src"]`, no `"jsx"` — zero upstream project references, matching its role as the dependency root of the whole package graph
- `packages/graph-core/src/index.ts` created as a minimal placeholder (`export {};` plus a comment noting real `GraphNode`/`GraphEdge`/`NormalizedGraph` types land in Phase 2/CORE-01) — enough for `tsc --build` to have a valid, non-empty compilation unit
- `pnpm install` correctly resolved the new workspace package; `pnpm exec turbo run build --filter=@gruporeacciona/graph-core` succeeded, producing real `dist/index.js`, `dist/index.d.ts`, `dist/index.d.ts.map`, and `dist/.tsbuildinfo`
- **Empirically proved the D-05 ESLint guard fires, not just documented:** temporarily added `import 'react';` to `src/index.ts` → `eslint packages/graph-core` exited 1 with `no-restricted-imports` naming `'react'`; removed it, temporarily added `fetch('http://example.com');` → exited 1 with `no-restricted-globals` naming `'fetch'` (exactly the mechanism RESEARCH.md's Pitfall 1 warns a naive imports-only rule would miss); removed it; final clean file re-linted with exit 0
- `packages/graph-core/src/index.ts` was restored byte-for-byte to its Task 1 placeholder content — `git status`/`git diff` confirm zero residual diff after Task 2's verification trials

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold packages/graph-core** - `6a482ba` (feat)
2. **Task 2: Empirically verify the D-05 architecture guard against graph-core** - no commit (verification-only task; temporary `react`-import and `fetch()` trials were reverted before completion, leaving zero diff against Task 1's committed state — nothing new to commit)

**Plan metadata:** commit pending (this SUMMARY + STATE.md + ROADMAP.md docs commit, created immediately after this file)

## Files Created/Modified
- `packages/graph-core/package.json` - `@gruporeacciona/graph-core`, zero UI/backend deps, build/lint/typecheck scripts
- `packages/graph-core/tsconfig.json` - extends root base, composite, no jsx, zero upstream references
- `packages/graph-core/src/index.ts` - placeholder entry point (Phase 2/CORE-01 will add real types)
- `.gitignore` - added `.turbo/` (generated build cache produced by this task's own verification run)
- `pnpm-lock.yaml` - regenerated to link the new `packages/graph-core` workspace member

## Decisions Made
- Added `.turbo/` to `.gitignore`: running `turbo run build` for Task 1's verification generated a `.turbo/` cache directory that would otherwise be left as an untracked generated artifact. This is a minimal, directly-caused-by-this-task hygiene fix (Rule 3), not a scope expansion — no other unrelated pre-existing untracked files (`LICENSE`, `README.md`, `docs/`, `examples/`, `.claude/skills/`, etc.) were touched, since those predate this plan and are out of scope per the Scope Boundary rule.
- Task 2 produced no commit: its own spec explicitly frames the `react`-import and `fetch()` trials as "temporary edits only, reverted before completion" — after reverting, `git diff`/`git status` on `packages/graph-core/src/index.ts` show zero changes versus Task 1's committed state, so there was nothing new to stage.

## Deviations from Plan

None - plan executed exactly as written. The `.gitignore` addition is standard task-commit-protocol hygiene (untracked generated file cleanup), not a deviation from the plan's declared task actions.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `packages/graph-core` is now a real, buildable, lint-clean TypeScript package with zero React/Three/backend coupling, structurally enforced (not just documented) — ready for `graph-renderer-three` (Plan 01-04), `react-knowledge-graph` (Plan 01-05), and `adapters/codebase-memory` (Plan 01-06) to depend on it via `workspace:*`.
- Root `tsconfig.json`'s solution-style `references` array still points at three package directories that do not yet exist (`graph-renderer-three`, `react-knowledge-graph`, `adapters/codebase-memory`) — this remains expected/intentional until Plans 01-04..01-06 complete; do not run a full-tree `tsc --build` until then.
- The D-05 ESLint block is now empirically confirmed working end-to-end against a real package; Plans 01-04..01-06 can rely on the same mechanism (D-06/D-07/D-08 blocks) without re-deriving it from scratch, though each should still spot-check its own block per its own plan's verification section.
- No blockers for Plan 01-04.

---
*Phase: 01-repo-scaffolding-compliance-gates*
*Completed: 2026-07-08*

## Self-Check: PASSED

All created files confirmed present on disk (packages/graph-core/package.json, packages/graph-core/tsconfig.json, packages/graph-core/src/index.ts, this SUMMARY.md). Task 1 commit hash (6a482ba) confirmed present in `git log --oneline --all`. Task 2 produced no commit by design (verification-only, zero residual diff).
