# DirakitPro — Visual Polish Pass (finalized order)

| Field | Value |
|---|---|
| Status | **v1 — finalized order, not yet built** |
| Last updated | 25 August 2026 |
| References | `DESIGN.md`, `CLAUDE.md` item 12, `SCREEN_INVENTORY.md`, `LEARNING_WORKSPACE.md`, `PROJECT_SHOWCASE.md` |
| Trigger | Manual testing (24–25 Aug) confirmed pages are structurally correct but visually plain — expected, since every prior wave was built to layout-region level, not pixel level. |

Every existing page is functionally correct. This pass changes appearance and information density only — no new business logic, no new routes, no schema changes except the one flagged in Group 4.

## Order

**1. Homepage (`/`)** — first, not parallel. It's the front door for every persona, it's still the unmodified `create-next-app` scaffold (zero prior work to preserve), and it's structurally the simplest page in the product — the right place to establish the visual language before applying it everywhere else. Scope: hero, featured courses (pull from Catalog), value proposition per brand voice (4.5), footer. Featured bundle/project sections stay empty/hidden until Commerce and Wave 7 give them real content — don't fake it with placeholder data.

**2. Catalog (`/courses`, `/courses/[slug]`, `/bundles`, `/bundles/[slug]`)** — second point of contact for a stranger, medium complexity (cards, grid). Confirms the visual language holds before the harder pages.

**3. Commerce (`/checkout/*`, `/payment/[orderId]`, `/account/orders`)** — the trust-critical moment (someone is about to pay). Must be done before Learning polish, not after.

**4. Learning (`/dashboard` → `/learn/[courseSlug]` → `/learn/[courseSlug]/[lessonSlug]`)** — internal order unchanged, this is right already. Scope, informed by the Dicoding reference session (25 Aug):
   - Sidebar: status icon (not started/in progress/done) per lesson + the existing Build Progress bar, styled per `DESIGN.md` 5.2.
   - Reading typography for `markdown` blocks: apply the type scale from the earlier reading-content mockup (17px/1.6 body, clear heading hierarchy).
   - New: a "tip" callout style for blockquotes in markdown (amber-tinted box, bulb icon) — CSS-only, no new content-block type.
   - New, needs a small schema addition (not pure CSS — flagging so it isn't silently skipped): `lessons.estimatedMinutes` (nullable integer), shown next to each lesson in the sidebar and course overview, matching the "30 Menit" pattern from the Dicoding reference. One migration, additive only.
   - Course-level resources (LRN-007) get a "yang kamu butuhkan" framing option (tools/prerequisites), not just bare links — same field, better presentation, no schema change needed for this part.
   - **Explicitly not doing:** dark theme for the reading pane (deferred separately, not part of this pass), tabs, certificates/forum/exam UI (out of PRD scope).

**5. Projects (`/projects/me`, `/projects/me/[projectId]`, `/projects`, `/projects/[username]/[slug]`)** — after Learning, since a learner needs real progress before they have something worth showcasing.

**6. Identity (`/login`, `/register`, `/forgot-password`)** — audit before assuming work is needed. These already use Clerk's prebuilt components themed with brand tokens (Fase 3, Wave 2) — likely close to done. Check first, only touch what's actually off.

**7. Admin (`/admin/*`)** — last. Only the founder uses this. Needs to be usable, not polished — don't spend real time here until everything above is done.

## Per-group checklist (apply to every group above)

- No hardcoded hex — every color traces to a `DESIGN.md` token. Flag and fix any found (this has been clean so far in every prior verification, but check anyway).
- No new business logic, no new routes, no state changes — if a "polish" task starts requiring new data or a new decision branch, stop and flag it rather than quietly expanding scope.
- Re-run that group's existing test suite after — visual changes shouldn't break assertions, but `getByRole`/`getByText` queries have broken on copy changes before (Wave 5 precedent) — expected, fix the query, not a regression.