# CLAUDE.md — DirakitPro

## Source of truth

- **Product spec:** `DirakitPro_MVP_PRD_V1.0.md` (internal version **V1.1** — see its metadata table and Appendix E). All P0 requirement IDs (`IAM-*`, `CAT-*`, `COM-*`, `LRN-*`, `BLD-*`, `PRJ-*`, `ADM-*`, `NTF-*`, `MTR-*`) are the acceptance criteria for their domain. Read the relevant section before implementing a feature — don't infer behavior from a filename or a route name alone.
- **Design tokens:** `docs/design/DESIGN.md`. All colors, spacing, radius, and type come from there. Never hardcode a hex value or arbitrary spacing in a component — if a token seems missing, stop and ask rather than inventing one.
- **Screen/route layout:** `docs/design/SCREEN_INVENTORY.md` and `docs/design/HOMEPAGE.md` — **not yet written**. Don't invent a screen's visual layout from scratch. Flag it and ask for the spec first.

## Scope discipline

- The PRD is **LOCKED** (V1.1). Implementing something that requires new P0 scope — a new entity, a new route, a new domain concept — is a Product Scope Change and needs explicit confirmation before code is written, not an inference that "this seems like it should exist."
- Non-goals are as binding as goals (PRD 5.2, 6.3). Do not build: mentor marketplace, in-app mentoring booking/payment (MTR-001 is external-link only), subscription billing, forum/community engine, live class infrastructure, gamification/points/leaderboard, corporate org accounts, mobile native apps, microservices.

## Architecture

- Next.js modular monolith. One deployable app, one PostgreSQL database. No microservices (14.1).
- Stack: TypeScript, Next.js 16, Tailwind + shadcn/ui, Clerk auth + internal `User` table (domain code always references the internal user ID, never the Clerk ID directly), Drizzle ORM, Midtrans Snap, Cloudflare R2 (file storage), YouTube unlisted (video hosting for MVP — see PRD Appendix F; `videoProviderId` is provider-neutral, don't assume Cloudflare Stream), Resend, PostHog, Sentry (14.2).
- Monorepo: `apps/web` is the deployable app. `packages/{database,auth,ui,email,validation,config}` are shared. Domain modules live at `apps/web/features/{identity,catalog,learning,enrollment,progress,project,commerce,bundle,payment,media,administration}` — treat each as a bounded context. Reach modules through their exported interface, not their internals (14.4).

## Build order

Don't build the whole MVP in one session. Work in dependency order, one module at a time, each ending in passing tests before moving to the next:

1. Database schema (PRD 11) + migrations — everything else depends on this. **Done.**
2. Identity (Clerk wiring + internal `User` table + provider mapping). **Done.**
3. Catalog (course/bundle read paths — no commerce yet). **Done.**
4. Commerce + Payment (Order/Payment/Bundle state machines, PRD 10 — highest-risk domain; follow the transition tables exactly, don't improvise a state). **Done.**
5. Learning + Build (workspace, progress, milestones). **Done.**
6. Project + Showcase.
7. Admin.
8. Email + Analytics — wire in alongside each domain above, not as a final pass.
9. Mentoring CTA (MTR-001) — static section + external scheduling link. No dependency on any other domain; can be picked up any time it's convenient, not necessarily in sequence.
10. Homepage (`/`) — currently the unmodified `create-next-app` scaffold, not yet touched. Deliberately sequenced after Project (6) and Admin (7): it features courses, bundles, and showcase projects, and the showcase content in particular doesn't really exist until Admin can `APPROVE`/`FEATURE` a project (PRJ-005/006). Building it earlier means building against placeholder data that gets thrown away.
11. Deployment to production — Vercel, production Midtrans/Clerk instances, real domain, production environment variables. Last step, after everything above is built and verified against local dev. Not yet discussed or planned as of this entry.

## Quality gates

Every module: lint → typecheck → unit/integration tests → E2E smoke for its critical flow (17.1–17.4) before it's considered done. The critical-coverage list in 17.2 isn't optional — those are the same items the PRD's own implementation-readiness audit flagged as commerce-integrity-critical.