---
phase: 01-repo-scaffolding-compliance-gates
reviewed: 2026-07-09T00:00:00Z
depth: standard
files_reviewed: 26
files_reviewed_list:
  - .github/workflows/ci.yml
  - .gitignore
  - NOTICE.md
  - THIRD_PARTY_NOTICES.md
  - eslint.config.js
  - examples/basic-usage/index.html
  - examples/basic-usage/package.json
  - examples/basic-usage/src/main.tsx
  - examples/basic-usage/vite.config.ts
  - package.json
  - packages/adapters/codebase-memory/package.json
  - packages/adapters/codebase-memory/src/index.ts
  - packages/adapters/codebase-memory/tsconfig.json
  - packages/graph-core/package.json
  - packages/graph-core/src/index.ts
  - packages/graph-core/tsconfig.json
  - packages/graph-renderer-three/package.json
  - packages/graph-renderer-three/src/index.ts
  - packages/graph-renderer-three/tsconfig.json
  - packages/react-knowledge-graph/package.json
  - packages/react-knowledge-graph/src/index.ts
  - packages/react-knowledge-graph/tsconfig.json
  - pnpm-lock.yaml
  - pnpm-workspace.yaml
  - tsconfig.base.json
  - tsconfig.json
  - turbo.json
findings:
  critical: 2
  warning: 4
  info: 1
  total: 7
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-07-09
**Depth:** standard
**Files Reviewed:** 26
**Status:** issues_found

## Summary

This phase scaffolds the monorepo (pnpm workspace, TypeScript project references, Turborepo, ESLint architecture guards, CI pipeline, license-compliance gate) with no real feature code yet — all four `packages/*/src/index.ts` files are intentional `export {}` placeholders. Given that, the review focused on whether the *gates themselves* actually enforce what they claim to enforce, since that is the explicit purpose of this phase (INFRA-01..07, "Repo Scaffolding & Compliance Gates").

Two things verified as genuinely correct and worth calling out explicitly (since the adversarial stance defaults to assuming defects): the three pinned GitHub Actions SHAs (`actions/checkout`, `pnpm/action-setup`, `actions/setup-node`) were independently checked against the GitHub API and all three resolve to the exact commit their trailing `# vX` comment claims — the supply-chain fix from commit `9faeafa` is intact and correct, not just superficially plausible. The `NOTICE.md` upstream pin (tag `v0.8.1` / SHA `f0c9be19...`) was also independently verified against the `DeusData/codebase-memory-mcp` GitHub API and is accurate.

However, two of the compliance gates that are the actual deliverable of this phase have real, provable holes: the license-compliance blocklist is not exhaustive for the license family it claims to block, and the ESLint architecture-boundary rule can be bypassed with a deep/subpath import for the exact libraries it exists to forbid. Both directly undermine the phase's own stated success criteria. Four further warnings and one info item cover a missing lint gate for adapter isolation, a coverage gap in the example package, CI permission hardening, and unknown-license handling.

## Critical Issues

### CR-01: License compliance gate's AGPL blocklist is not exhaustive — `AGPL-1.0-or-later` slips through

**File:** `package.json:13`
**Issue:** The `licenses:check` script's `--failOn` list is supposed to be an "exhaustive enumerated SPDX blocklist" for GPL/AGPL/SSPL (per this project's own documented policy in `.claude/CLAUDE.md`: *"GPL/AGPL/SSPL bloqueadas"*, and the phase's own pattern doc, which explicitly calls out that an exhaustive list — not an allow-list — is required precisely because `license-checker`'s matching is exact-string, not family-aware).

The current list is:
```
GPL-1.0-only;GPL-1.0-or-later;GPL-2.0-only;GPL-2.0-or-later;GPL-3.0-only;GPL-3.0-or-later;AGPL-1.0-only;AGPL-3.0-only;AGPL-3.0-or-later;SSPL-1.0
```
All 6 GPL SPDX variants are present, but only 3 of the 4 AGPL variants are present — `AGPL-1.0-or-later` is missing. A dependency (transitive or direct) declaring exactly `AGPL-1.0-or-later` in its `license` field will pass `license-checker-rseidelsohn --failOn` silently, defeating the gate for the exact license family this phase was built to block. This is a legal/compliance risk, not a style nit — it is the literal purpose of `licenses:check`.

**Fix:**
```json
"licenses:check": "license-checker-rseidelsohn --production=false --excludePrivatePackages --failOn \"GPL-1.0-only;GPL-1.0-or-later;GPL-2.0-only;GPL-2.0-or-later;GPL-3.0-only;GPL-3.0-or-later;AGPL-1.0-only;AGPL-1.0-or-later;AGPL-3.0-only;AGPL-3.0-or-later;SSPL-1.0\""
```
Also verify empirically (per the phase's own plan doc requirement): add a throwaway `AGPL-1.0-or-later`-licensed dependency on a scratch branch and confirm the gate fails, the same way the plan already requires doing for `GPL-3.0-only`.

### CR-02: Architecture-boundary ESLint rules can be bypassed with a deep/subpath import

**File:** `eslint.config.js:32,44,65` (and `:7` for the shared `axios` entry)
**Issue:** The D-05/D-06/D-08 blocks restrict `react`, `react-dom`, `three`, and `axios` via `no-restricted-imports`'s `paths` option:
```js
paths: [{ name: 'react' }, { name: 'react-dom' }, { name: 'three' }, ...noBackendCalls.paths],
```
`no-restricted-imports`'s `paths.name` matches the import specifier by **exact string equality only** — it does not match subpaths. Only the `@react-three/*` group is protected by a `patterns` glob. Concretely:
- `import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'` inside `packages/graph-core/**` is **not** caught by `{ name: 'three' }`, even though it is exactly the "graph-core must have zero dependency on Three.js" violation this rule exists to prevent (mandatory, per `.claude/CLAUDE.md`: *"graph-core must have zero dependency on React or Three.js"*, and per `docs/03-architecture.md`, explicitly called a hard constraint whose violation is "an architecture regression, not a style nit").
- The same bypass applies to `react/jsx-runtime`, `react-dom/client` in `graph-core` (D-05), and to `axios/lib/...` anywhere `noBackendCalls` is used (D-05, D-06, D-07).
- This directly weakens Roadmap Success Criterion #2 for this phase ("a PR that introduces a React/Three.js import ... within `graph-core` or `react-knowledge-graph` fails lint in CI") — it is only guaranteed for the bare specifier form, not for the equally-valid subpath form.

**Fix:** Add a `patterns` entry (or extend the existing one) covering both the bare name and its subpaths for every currently exact-matched module:
```js
patterns: [
  { group: ['@react-three/*'], message: 'graph-core must not depend on Three.js/R3F.' },
  { group: ['three', 'three/*'], message: 'graph-core must not depend on Three.js/R3F.' },
  { group: ['react', 'react/*', 'react-dom', 'react-dom/*'], message: 'graph-core must not depend on React.' },
  { group: ['axios', 'axios/*'], message: 'No internal HTTP calls (ADR 0003).' },
],
```
and drop the now-redundant exact-name `paths` entries for the same modules (or keep both — `patterns` alone is sufficient and simpler). Apply the equivalent fix to the D-06 and D-08 blocks. Then repeat the phase's own required manual verification step (add a throwaway restricted import, confirm lint fails, remove it) using a **subpath** import this time, not just a bare one.

## Warnings

### WR-01: No lint (or other) gate prevents `react-knowledge-graph` from importing `packages/adapters/*`

**File:** `eslint.config.js` (missing block)
**Issue:** `.claude/CLAUDE.md` and this phase's own pattern doc (`01-PATTERNS.md:162`) state as a hard constraint: *"`adapters/codebase-memory` ... must never be referenced by `react-knowledge-graph`"* and *"adapters/* packages ... must not live inside the main React package"*. The D-05 through D-08 ESLint blocks enforce React/Three/backend boundaries for every package, but none of them restrict any package from importing `@gruporeacciona/adapter-codebase-memory` or anything under `packages/adapters/**`. Today this is only prevented incidentally, because `react-knowledge-graph/package.json` does not declare the adapter as a dependency and pnpm's default strict (non-hoisted) linking means the import would fail to resolve — i.e., the constraint is enforced by omission, not by an explicit compliance gate, unlike every other documented architectural boundary in this same file.
**Fix:** Add a scoped block mirroring D-05..D-08's style, e.g.:
```js
// D-06 (extended): react-knowledge-graph must never import adapters/*
{
  files: ['packages/react-knowledge-graph/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{ group: ['@gruporeacciona/adapter-*', '**/adapters/*'], message: 'Adapters must not be imported by react-knowledge-graph (see docs/03-architecture.md).' }],
    }],
  },
},
```

### WR-02: `examples/basic-usage` has no `tsconfig.json` and no `lint`/`typecheck` scripts — its TS/JSX source is never checked by CI

**File:** `examples/basic-usage/package.json` (missing scripts), missing `examples/basic-usage/tsconfig.json`
**Issue:** Every package under `packages/*` declares all three of `build`, `lint`, `typecheck`. `examples/basic-usage/package.json` declares only `dev` and `build` (`vite`/`vite build`). Turborepo silently skips a task for any package lacking the matching script (documented and relied upon elsewhere in this same phase for `packages/adapters/codebase-memory`'s intentionally-absent `build` script), so `pnpm exec turbo run build lint typecheck` in CI runs **no lint and no type-check at all** against `examples/basic-usage/src/main.tsx` — only a Vite/esbuild transpile, which does not type-check. There is also no `tsconfig.json` in this directory at all, so even a manually-invoked `tsc` would have nothing to extend/configure against. This is a real coverage gap in the exact kind of guarantee this phase is meant to deliver (Roadmap Success Criterion #1 talks about the whole monorepo, including `examples/*`, "resolviendo TypeScript vía project references sin errores").
**Fix:** Add `examples/basic-usage/tsconfig.json` extending `../../tsconfig.base.json` with `jsx: "react-jsx"`, and add `"lint": "eslint ."` / `"typecheck": "tsc --noEmit"` scripts to `examples/basic-usage/package.json` so it is checked identically to every workspace package.

### WR-03: CI workflow does not set an explicit least-privilege `permissions:` block

**File:** `.github/workflows/ci.yml`
**Issue:** Commit `9faeafa` (verified intact — SHA pins are correct) hardened this workflow against a specific supply-chain threat (mutable tag repointing). A related, commonly-paired hardening step is missing: the workflow has no top-level `permissions:` key, so the `GITHUB_TOKEN` used implicitly by the checkout/setup actions inherits the repository/organization default token permissions rather than being scoped down to the minimum this job actually needs (it only reads code, builds, and lints — it never writes to the repo, opens PRs, or touches packages).
**Fix:**
```yaml
permissions:
  contents: read
```
placed at the workflow or job level.

### WR-04: License gate has no explicit handling for dependencies with missing/unrecognized license metadata

**File:** `package.json:13`
**Issue:** `license-checker-rseidelsohn --failOn "<list>"` only fails the build for packages whose license field exactly matches an entry in the list. A dependency with no `license` field, or a non-SPDX/custom string (`UNKNOWN`, `SEE LICENSE IN LICENSE.txt`, etc.), passes the gate silently even though its actual terms could be anything, including GPL/AGPL/SSPL-incompatible ones. `license-checker`-family tools support an `--onlyunknown` (or similar unknown-license) reporting mode for exactly this case.
**Fix:** Add a second check (can be non-blocking/advisory per the phase's own explicitly-deferred policy on the "manual review" tier) that surfaces packages with unrecognized license fields, e.g. `license-checker-rseidelsohn --production=false --unknown` as a separate, visible CI step, so unknown licenses are at least reported rather than silently passing.

## Info

### IN-01: Root solution-style `tsconfig.json` is not wired into any script

**File:** `tsconfig.json`
**Issue:** The root `tsconfig.json` (`"files": [], "references": [...]`) is the TypeScript "solution-style" aggregator described in the phase's pattern doc, but no `package.json` script or `turbo.json` task ever invokes `tsc --build` at the repo root — `turbo run build` instead calls each package's own `tsc --build` independently. The root file is therefore only useful for IDE-wide project awareness or a manually-run `tsc -b` from the repo root; this is a legitimate and common pattern, not a defect, but worth noting so a future contributor doesn't assume this file is part of the CI-enforced build graph.
**Fix:** None required; consider a code comment noting its IDE-only/manual-build purpose if this becomes a point of confusion.

---

_Reviewed: 2026-07-09_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
