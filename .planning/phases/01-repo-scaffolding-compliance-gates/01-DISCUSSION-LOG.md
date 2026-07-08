# Phase 1: Repo Scaffolding & Compliance Gates - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-08
**Phase:** 1-Repo Scaffolding & Compliance Gates
**Areas discussed:** Fijación del commit fuente en NOTICE.md, Alcance exacto de la regla ESLint por paquete, Stubs de paquetes adapters (v2)

---

## Fijación del commit fuente en NOTICE.md

| Option | Description | Selected |
|--------|-------------|----------|
| Último release tag: v0.8.1 | SHA f0c9be19c5d74b84f418d807bfdce7b5d6a261ff, publicado 2026-06-12. Versión estable y etiquetada. | ✓ |
| HEAD actual de main | SHA b637e3330c96cfe452da623db068c241aaa3ec01, 2026-07-07, no etiquetado. | |
| Aún no lo sé — decide tú | Aplicar criterio recomendado por defecto. | |

**User's choice:** Último release tag: v0.8.1
**Notes:** Verificado en vivo vía `gh api repos/DeusData/codebase-memory-mcp/tags` y `.../releases` durante la discusión.

| Option | Description | Selected |
|--------|-------------|----------|
| Texto completo inline en NOTICE.md | Copia literal completa (Copyright + texto MIT) dentro de NOTICE.md. | ✓ |
| Referencia a archivo separado | NOTICE.md resume y enlaza a una copia en otro archivo. | |

**User's choice:** Texto completo de la licencia MIT inline en NOTICE.md

| Option | Description | Selected |
|--------|-------------|----------|
| Pin definitivo de Fase 1 | Fase 3 importa exactamente v0.8.1 sin reconsiderar. | |
| Re-verificar en Fase 3 y actualizar si cambió | Fase 3 vuelve a comprobar el último release antes de importar. | ✓ |

**User's choice:** Re-verificar en Fase 3 y actualizar el pin si hay una versión más reciente

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, actualizar PROJECT.md ahora | Completar la fila existente con el SHA/tag concreto. | ✓ |
| No, basta con NOTICE.md | Evitar duplicar la referencia. | |

**User's choice:** Sí, actualizar PROJECT.md ahora

---

## Alcance exacto de la regla ESLint por paquete

| Option | Description | Selected |
|--------|-------------|----------|
| React + Three.js + fetch/axios/useQuery en graph-core | Todo lo no-agnóstico bloqueado. | ✓ |
| Solo fetch/axios/useQuery en graph-core | Solo aplica ADR 0003 literalmente. | |

**User's choice:** React + Three.js + fetch/axios/useQuery (todo lo no-agnóstico) en graph-core

| Option | Description | Selected |
|--------|-------------|----------|
| fetch/axios/useQuery + 'three' directo bloqueados en react-knowledge-graph | Refuerza ADR 0003 y la frontera de capas hacia graph-renderer-three. | ✓ |
| Solo fetch/axios/useQuery en react-knowledge-graph | Permite import directo de 'three'. | |

**User's choice:** fetch/axios/useQuery + import directo de 'three' bloqueados en react-knowledge-graph

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, bloquear fetch/axios/useQuery en graph-renderer-three también | ADR 0003 aplica a toda la pila de renderizado. | ✓ |
| No, solo graph-core y react-knowledge-graph | Ceñido al texto literal de INFRA-03. | |

**User's choice:** Sí, también bloquear fetch/axios/useQuery en graph-renderer-three

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, bloquear React/Three.js en adapters/* | Los adapters deben ser funciones puras de conversión, verificable por lint. | ✓ |
| No, sin restricción por ahora | Los adapters de v1 aún no tienen código real en Fase 1. | |

**User's choice:** Sí, bloquear React/Three.js en adapters/*

---

## Stubs de paquetes adapters (v2)

| Option | Description | Selected |
|--------|-------------|----------|
| Solo carpeta/package.json de codebase-memory ahora | graphology y neo4j se crean en Milestone 6 (YAGNI). | ✓ |
| Crear las 3 carpetas de adapters ahora | Sigue el texto literal de INFRA-01/ROADMAP. | |

**User's choice:** Solo carpeta/package.json de codebase-memory ahora; graphology y neo4j se crean en Milestone 6

| Option | Description | Selected |
|--------|-------------|----------|
| Solo package.json + tsconfig.json (sin lógica) | Consistente con Fase 1 como scaffolding puro. | ✓ |
| Stub de fromCodebaseMemory() con 'not implemented' | Deja un contrato de función visible desde ya. | |

**User's choice:** Solo package.json + tsconfig.json (sin lógica), listo para cuando llegue el adapter real

| Option | Description | Selected |
|--------|-------------|----------|
| Skeleton de proyecto Vite sin app funcional | Se completa con datos mock reales en Fase 3. | ✓ |
| No crear examples/* todavía | Diferir hasta que haya algo real que mostrar. | |

**User's choice:** Solo el package.json/skeleton del proyecto de ejemplo (Vite), sin app funcional aún

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, usar el scope @gruporeacciona/... desde ya | Uso interno vía pnpm workspaces, no equivale a publicación. | ✓ |
| Nombres genéricos sin scope por ahora | Evita cualquier referencia a la marca hasta aprobación de publicación. | |

**User's choice:** Sí, usar el scope @gruporeacciona/... desde ya (uso interno, sin publicar)

---

## Claude's Discretion

Ninguna — todas las preguntas fueron respondidas explícitamente por el usuario.

## Deferred Ideas

- Alcance del bloqueo de licencias en CI (nivel "revisión manual" MPL/LGPL/EPL: ¿bloquear o solo avisar?) — no seleccionado para discusión; queda documentado como pendiente en `01-CONTEXT.md` para que el planner/researcher lo resuelva con el criterio por defecto de `docs/08-licensing-compliance.md` o escale al usuario si es ambiguo.
- Stubs de `graphology`/`neo4j` adapters — diferidos explícitamente a Milestone 6 (v2).
