# External Integrations

**Analysis Date:** 2026-07-08

## Current State

No external integrations exist in this repository today. It is a documentation-only project with no runtime code, no network calls, and no configured services. Everything below reflects **planned** integrations described in the design docs, framed as adapters that convert external data sources into the library's neutral graph model — not live connections.

## APIs & External Services

**None currently implemented.** By explicit architectural decision (`docs/adr/0003-no-internal-fetching.md`), the core `KnowledgeGraphViewer` React component will **never** make internal HTTP calls or own API configuration:

> "`KnowledgeGraphViewer` no hará llamadas HTTP internas. Los datos entran por props." (`docs/adr/0003-no-internal-fetching.md`)

Incorrect pattern the library explicitly avoids: `<KnowledgeGraphViewer apiUrl="/api/graph" />`
Correct pattern: `<KnowledgeGraphViewer nodes={nodes} edges={edges} />` (`docs/03-architecture.md`)

**Planned adapter sources (data-shape converters, not live API clients maintained by this library):**
- Codebase Memory MCP - source project being extracted from; first planned adapter (`fromCodebaseMemoryGraph`), per `docs/06-extraction-plan.md` Fase 5
- Neo4j - planned adapter `fromNeo4jRecords`, per `docs/03-architecture.md` and roadmap Milestone 6
- Graphology - planned adapter `fromGraphology`, per `docs/03-architecture.md` and roadmap Milestone 6
- Generic JSON - planned adapter, per `docs/07-roadmap.md` Milestone 6

Planned package namespace for these adapters (not yet published):
```
packages/adapters/codebase-memory/
packages/adapters/graphology/
packages/adapters/neo4j/
```

## Data Storage

**Databases:**
- None. This library is explicitly designed to be storage-agnostic — the consuming application is responsible for fetching graph data and passing it in via `nodes`/`edges` props (`docs/03-architecture.md`, `docs/adr/0003-no-internal-fetching.md`).
- Neo4j is referenced only as a potential upstream data source consumed through a future adapter, not as a dependency of the library itself.

**File Storage:**
- Local filesystem only (Markdown docs, JSON schema example). No file upload/storage integration.

**Caching:**
- None.

## Authentication & Identity

**Auth Provider:**
- None. The library's design explicitly excludes authentication/transport concerns — `docs/adr/0003-no-internal-fetching.md` states the consumer must load data "before or around" the component, keeping the library decoupled from auth.

## Monitoring & Observability

**Error Tracking:**
- None configured.

**Logs:**
- None configured. No logging library or convention established yet.

## CI/CD & Deployment

**Hosting:**
- Not applicable yet — this is a library repo, not a deployed application. Target distribution is an npm package (proposed name `@gruporeacciona/react-knowledge-graph`, per `README.md`).

**CI Pipeline:**
- None configured yet (no `.github/workflows/`, no other CI config detected).
- Planned CI steps per `docs/06-extraction-plan.md` Fase 0 and `docs/08-licensing-compliance.md`:
  - lint
  - typecheck
  - tests
  - license check (`pnpm licenses list`, `pnpm audit`, optionally `license-checker-rseidelsohn`)

## Environment Configuration

**Required env vars:**
- None currently. No `.env` files exist in the repo (`.gitignore` reserves `.env`/`.env.*` patterns for future use but none are present).

**Secrets location:**
- Not applicable — no secrets exist in this repository. Per Grupo Reacciona policy, any future secrets must use environment variables or a secret manager and must never be committed or shared outside authorized channels.

## Webhooks & Callbacks

**Incoming:**
- None.

**Outgoing:**
- None. The component's public callback props (`onNodeClick`, `onNodeDoubleClick`, `onNodeHover`, `onEdgeClick`, `onSelectionChange`, per `docs/05-react-api.md`) are in-process React event callbacks, not network webhooks.

---

*Integration audit: 2026-07-08*
