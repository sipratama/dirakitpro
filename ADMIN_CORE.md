# DirakitPro — Admin Core Deep-Dive (Wave 7a)

| Field | Value |
|---|---|
| Status | **v1 — draft, not yet built** |
| Last updated | 25 August 2026 |
| References | `DirakitPro_MVP_PRD_V1.0.md` §8.7 (ADM-001, 005–008), §11.1 (`AdminAuditLog`), §12.3; `CLAUDE.md` |
| Scope | `/admin`, `/admin/users`, `/admin/orders`, `/admin/projects`, `/admin/projects/[projectId]`. **Not in scope:** ADM-002/003/004 (course/curriculum/bundle authoring) — deferred to Wave 7b, tracked in `CLAUDE.md`. |

## 1. Access control (shared by every route below)

- `proxy.ts` already protects the `/admin` prefix (Wave 2) — an unauthenticated visitor is redirected to `/login` before any page in this doc even runs.
- What's still needed: authenticated-but-not-`ADMIN` must not learn that admin routes exist. Every page here calls `requireAdmin()` (Wave 2) and treats its rejection as `notFound()` — same information-hiding principle as Order/Payment/Project ownership checks, not a 403 that confirms the route is real.

## 2. `/admin` — dashboard

- **Layout:** links to the three sections below, plus one number that matters more than the rest: **count of projects with `moderationStatus = UNREVIEWED`**, linking straight into the pre-filtered queue (§5). This dashboard's only job is to point at the actionable thing — it is not a general analytics page (PostHog covers that per PRD §13).

## 3. `/admin/users` — learner view (ADM-005)

- **Layout:** table — email/username, role, joined date, enrollment count. Read-only, no actions.
- Intentionally minimal per ADM-005's own wording ("melihat learner dan enrollment dasar") — no search/filter infra for MVP scale (a handful of learners at most right now).

## 4. `/admin/orders` — commerce view (ADM-006)

- **Layout:** table — user, item (course or bundle title from the immutable `OrderItem` snapshot, same source `/account/orders` already uses), amount, status, date. Read-only.

## 5. `/admin/projects` — moderation queue (ADM-007)

- **Layout:** table, default-filtered to `moderationStatus = UNREVIEWED` (the actual queue), with a toggle to view all. Per row: learner, course, project title, current moderation status, featured flag, link into the detail page (§6).
- **Why a separate detail page, not inline actions:** ADM-007 requires the admin to actually judge content (screenshot, description, live URL) before approving — a bare list of buttons invites rubber-stamping. Not explicitly required by the PRD text, flagging as my default: this mirrors the list→detail pattern already used everywhere else in the product (Courses, Bundles, Orders all work this way), so it's consistent, not a new pattern.

## 6. `/admin/projects/[projectId]` — moderation detail & actions (ADM-007)

- **Layout:** full read view of the project (same content a visitor would see at `/projects/[username]/[slug]` — screenshot, description, live URL, features, technologies) plus a moderation panel.
- **Actions (decision, not fully specified in PRD — flagging my defaults):**
  - **Approve** — any prior state → `APPROVED`. No reason required.
  - **Reject** — any prior state → `REJECTED`. Reason **required** (ADM-007 explicitly calls out storing a reason).
  - **Hide** — typically `APPROVED → HIDDEN` (pulling down something previously approved). Reason **required**.
  - **Feature / Un-feature** — independent toggle, only settable while `moderationStatus = APPROVED` (mirrors the existing invariant in `setProjectVisibility` that already blocks `PUBLIC` unless `SUBMITTED` — same shape of rule, don't invent a different one).
  - No restriction on which state an admin can move to from which — this is a moderation tool, not a learner-facing workflow; admins can reconsider a prior Reject/Hide.
- **Every action here writes one `AdminAuditLog` row** (ADM-008): `action` (`PROJECT_APPROVED`/`PROJECT_REJECTED`/`PROJECT_HIDDEN`/`PROJECT_FEATURED`/`PROJECT_UNFEATURED`), `targetType: "project"`, `targetId`, `reason` where applicable, `beforeData`/`afterData` as `{ moderationStatus }` or `{ isFeatured }` snapshots. No dedicated log-viewing UI (ADM-008 explicitly doesn't require one) — direct DB inspection is enough for MVP.

## 7. Open items — deliberately not decided here

- Whether `/admin/orders` needs any manual action (e.g., marking a payment issue resolved) — ADM-006 says "view" only, so none built here; revisit if it turns out read-only isn't enough in practice.
- Search/pagination on `/admin/users`/`/admin/orders`/`/admin/projects` once scale actually warrants it — not now.