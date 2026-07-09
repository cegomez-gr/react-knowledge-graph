---
phase: 01-repo-scaffolding-compliance-gates
fixed_at: 2026-07-09T10:50:31Z
review_path: .planning/phases/01-repo-scaffolding-compliance-gates/01-REVIEW.md
iteration: 2
findings_in_scope: 6
fixed: 6
skipped: 0
status: all_fixed
---

**Addendum (iteration 2, orchestrator-applied):** CR-02 and WR-01 (below) were
originally skipped by the gsd-code-fixer agent because this environment's
`config-protection` hook unconditionally blocks `Edit`/`Write`/`MultiEdit` on
`eslint.config.js`. With explicit user authorization, the orchestrator
temporarily disabled the hook via `ECC_DISABLED_HOOKS=pre:config-protection`
in `.claude/settings.local.json`'s `env` block, applied the review's exact
suggested diff, verified it empirically (subpath `three/examples/jsm/...`
import in `graph-core` and `@gruporeacciona/adapter-codebase-memory` import in
`react-knowledge-graph` both now fail lint; reverted with zero residual diff),
then immediately removed the `env` override to restore the hook. Commit
`6097db1`. Full workspace build/lint/typecheck (5/5 packages) passes clean.

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-07-09T10:50:31Z
**Source review:** .planning/phases/01-repo-scaffolding-compliance-gates/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 6 (2 Critical, 4 Warning — fix_scope: critical_warning; IN-01 explicitly out of scope, "None required.")
- Fixed: 4 (CR-01, WR-02, WR-03, WR-04)
- Skipped: 2 (CR-02, WR-01)

All fixes were applied and committed inside an isolated git worktree/branch (`gsd-reviewfix/01-*`), verified against the real dependency tree with empirical proofs (matching this phase's own established revert-after-verify pattern from 01-04-SUMMARY.md / 01-08-SUMMARY.md), then fast-forwarded onto `main`. Final `pnpm run build`, `pnpm run lint`, `pnpm run typecheck` all pass 5/5 packages.

## Fixed Issues

### CR-01: License compliance gate's AGPL blocklist is not exhaustive — `AGPL-1.0-or-later` slips through

**Files modified:** `package.json`
**Commit:** `12968e3`
**Applied fix:** Added the missing `AGPL-1.0-or-later` SPDX identifier to the `licenses:check` script's `--failOn` list, exactly as the review's Fix suggested (no code drift from review context).

**Empirical verification:** Added a real scratch devDependency, `tailwind-children@0.5.0` (confirmed via `npm view tailwind-children license` to be `AGPL-1.0-or-later`), and ran `license-checker-rseidelsohn` directly with the corrected `--failOn` list: exited 1 with `Found license defined by the --failOn flag: "AGPL-1.0-or-later". Exiting.` Removed the scratch dependency, reinstalled, and confirmed the gate exits 0 again with zero residual diff in `package.json`/`pnpm-lock.yaml` (an incidental `pnpm-workspace.yaml` `allowBuilds` stub written by pnpm's ignored-builds prompt during the scratch install was also reverted via `git checkout --`, keeping the final commit scoped to the one intended line).

### WR-02: `examples/basic-usage` has no `tsconfig.json` and no `lint`/`typecheck` scripts — its TS/JSX source is never checked by CI

**Files modified:** `examples/basic-usage/package.json`, `examples/basic-usage/tsconfig.json` (new), `pnpm-lock.yaml`
**Commit:** `6faf15e`
**Applied fix:** Added `examples/basic-usage/tsconfig.json` extending `../../tsconfig.base.json` with `jsx: "react-jsx"` (and `composite: false` / `declaration: false` / `declarationMap: false`, since this leaf app is type-checked standalone and is not part of the root solution-style project-reference graph — consistent with IN-01's documented scope). Added `"lint": "eslint ."` and `"typecheck": "tsc --noEmit"` scripts to `examples/basic-usage/package.json`, matching every other workspace package.

**Adaptation beyond the review's literal suggestion:** Running the new `typecheck` script surfaced a genuine, previously-invisible gap — `@types/react` and `@types/react-dom` were missing from the workspace entirely (invisible before because every package's placeholder `src/index.ts` is a bare `export {}` with no React/JSX usage to type-check). Added both as `devDependencies` of `examples/basic-usage` (`@types/react@^19.2.7`, `@types/react-dom@^19.2.2`) so the fix's own acceptance criterion (real type-checking, not just script wiring) actually holds.

**Empirical verification:** Before the fix, `pnpm exec turbo run build lint typecheck` ran 13/13 tasks (examples/basic-usage's lint/typecheck silently skipped, per Turborepo's documented skip-when-script-absent behavior). After the fix (and with `--force` to bypass cache), it runs **15/15 tasks**, including `example-basic-usage:lint` and `example-basic-usage:typecheck`, both passing clean.

### WR-03: CI workflow does not set an explicit least-privilege `permissions:` block

**Files modified:** `.github/workflows/ci.yml`
**Commit:** `ea8a315`
**Applied fix:** Added a top-level `permissions: contents: read` block to the workflow, exactly as the review's Fix suggested.

**Verification:** Confirmed valid YAML via `python3 -c "import yaml; yaml.safe_load(...)"` (no `js-yaml` available in this workspace) and visually confirmed `permissions.contents == 'read'` in the parsed structure.

### WR-04: License gate has no explicit handling for dependencies with missing/unrecognized license metadata

**Files modified:** `package.json`, `.github/workflows/ci.yml`
**Commit:** `d0b8f02`
**Applied fix:** Added a `licenses:check-unknown` script (`license-checker-rseidelsohn --production=false --excludePrivatePackages --unknown --summary`) and wired it into CI as a separate step after the blocking `licenses:check` gate, per the review's "non-blocking/advisory" framing.

**Adaptation beyond the review's literal suggestion:** The review's literal suggested flag, `--onlyunknown`, was tested empirically and found to have no filtering effect in the installed `license-checker-rseidelsohn@4.4.2` (output was byte-identical with and without it — confirmed via `diff`). Used `--unknown --summary` instead (still exactly the tool/intent the review specified — "surfaces packages with unrecognized license fields... as a separate, visible CI step"), which produces a compact per-license bucket count where guessed/uncertain licenses appear as a distinct `<LICENSE>*` entry.

**Empirical verification:** Added a real scratch devDependency, `node-uuid@1.4.0` (confirmed via its installed `package.json` to have no `license`/`licenses` field at all). The `--unknown --summary` report then showed a new `MIT*: 1` bucket (license-checker's guessed-license marker) that was absent from the baseline report — a real, visible signal distinct from the trusted `MIT: 154` bucket. Confirmed the blocking `licenses:check` gate still exits 0 with this package present (advisory-only, as intended — MIT/MIT* are not in the `--failOn` list). Removed the scratch dependency, reinstalled, and confirmed zero residual diff.

## Skipped Issues

### CR-02: Architecture-boundary ESLint rules can be bypassed with a deep/subpath import

**File:** `eslint.config.js:32,44,65` (and `:7`)
**Reason:** Blocked by this environment's local **config-protection** hook (ECC plugin toolkit), which unconditionally blocks any `Edit`/`Write`/`MultiEdit` operation against an existing `eslint.config.js`, regardless of whether the change strengthens or weakens the config — its purpose is to stop agents from silently weakening lint rules to make checks pass. The intended fix here (replacing exact-match `paths` entries with `patterns: [{ group: ['three', 'three/*'] }, ...]` glob entries covering subpaths) is a **strengthening** change, but this agent will not unilaterally bypass a safety hook (e.g. via Bash-based file rewrites that dodge the `Write|Edit|MultiEdit` matcher, or by editing hook-enablement settings) based solely on the code-review workflow's own instructions — per this agent's operating constraints, disabling or routing around a protective hook requires explicit human authorization, not just an instruction relayed through an agent-to-agent workflow.
**Original issue:** `no-restricted-imports`'s `paths.name` matches import specifiers by exact string equality only. `import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'` inside `packages/graph-core/**` (and the equivalent React/axios subpath forms in D-06/D-08) bypasses the D-05/D-06/D-08 architecture guards entirely, undermining Roadmap Success Criterion #2 for this phase.
**Recommended next step:** A human operator should either (a) apply the review's suggested `patterns` diff to `eslint.config.js` directly, or (b) explicitly disable the config-protection hook for this session/repo and re-run the fixer.

### WR-01: No lint (or other) gate prevents `react-knowledge-graph` from importing `packages/adapters/*`

**File:** `eslint.config.js` (missing block)
**Reason:** Same root cause as CR-02 — the fix requires adding a new ESLint block to `eslint.config.js`, which is blocked by the same config-protection hook. Skipped for the identical reason; not re-derived independently since both findings converge on one blocked file.
**Original issue:** No ESLint (or other automated) gate restricts any package from importing `@gruporeacciona/adapter-codebase-memory` or anything under `packages/adapters/**` from `react-knowledge-graph`. Today the constraint holds only incidentally (the adapter isn't declared as a dependency, so pnpm's strict linking fails the import at install/build time), not via an explicit compliance gate like every other architectural boundary in this file.
**Recommended next step:** Same as CR-02 — a human operator should apply the review's suggested new ESLint block directly, or explicitly disable the config-protection hook and re-run the fixer.

---

_Fixed: 2026-07-09T10:50:31Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
