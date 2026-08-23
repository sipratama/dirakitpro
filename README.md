# DirakitPro

Profesional itu dirakit.

## Current Phase

MVP Implementation — Identity & Auth

## Product Source of Truth

[`DirakitPro_MVP_PRD_V1.0.md`](DirakitPro_MVP_PRD_V1.0.md) — now at **V1.1** internally (file name unchanged; see the document's own version field and Appendix E for the amendment log). LOCKED. All product scope decisions trace back to this document.

## Documentation Map

```text
DirakitPro_MVP_PRD_V1.0.md              Product PRD (source of truth, LOCKED, internally V1.1)
README.md                               This file
CLAUDE.md                               Engineering/agent working instructions
DESIGN.md                               Design tokens (colors, spacing, radius, type)

docs/
├── product/archive/                    Historical, non-active — V0.3 Product Lock Candidate snapshot
└── audits/                             Historical, non-active — PRD V1.0 implementation readiness audit trail
```

## Status

```text
Product Requirements: LOCKED
MVP Design:            Visual direction LOCKED — brand palette, typography, and
                        spacing/radius tokens finalized (DESIGN.md 2-4). Screen-level
                        layout (HOMEPAGE.md, SCREEN_INVENTORY.md) not yet written.
Implementation:        IN PROGRESS
```

What exists so far:

- **Done** — pnpm/Turborepo monorepo scaffold; Next.js 16 skeleton in `apps/web` with
  Tailwind + shadcn/ui wired to the DESIGN.md tokens; full Drizzle schema for the PRD 11
  data model, with the first migration generated and applied to a local dev database.
- **In progress** — Identity & Auth (Clerk wiring, internal `User` table, route
  protection).
- **Not started** — Catalog, Commerce/Payment, Learning/Build, Project/Showcase, Admin,
  Email, Analytics.

No feature beyond Identity & Auth has working application code yet.
