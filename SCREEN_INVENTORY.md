# DirakitPro — Screen Inventory

| Field | Value |
|---|---|
| Status | **v1 — in progress** (Wave 3 detailed; Wave 4–7 stubbed, filled in as each wave starts) |
| Last updated | 23 August 2026 |
| References | `DirakitPro_MVP_PRD_V1.0.md` §8 (functional requirements), §10 (state rules), §12 (routes); `DESIGN.md` (tokens/components); `CLAUDE.md` (build order) |

## How to read this document

Screens are grouped by **build wave** (matches `CLAUDE.md`'s build order), not by PRD §12's guest/learner/admin split. That split is correct for *access control* but wrong for *sequencing* — e.g. `/projects` reads as a "public route" in §12.1, but it belongs to the Project domain (Wave 6), built well after Catalog (Wave 3). Grouping by wave means: don't build a screen until its wave's backend domain exists.

Each entry: **Route** · **Access** · **Requirement IDs** (pointer into PRD §8, not copied text) · **Layout regions** (high-level blocks, not pixels) · **States** (loading/empty/error are listed explicitly — they're what gets skipped when jumping straight to the happy path) · **Actions**.

Screens complex enough to need more than this (Homepage, Course Detail once commerce is live, Learning Workspace) get their own deep-dive file when their wave starts — this file stays an index, not a full mockup for 20+ routes.

## Wave map

| Wave | Domain | Screens | Status |
|---|---|---|---|
| 2 | Identity | `/login`, `/register`, `/forgot-password` | Built (Clerk defaults) |
| 3 | Catalog | `/courses`, `/courses/[slug]`, `/bundles`, `/bundles/[slug]` | **Detailed below** |
| 4 | Commerce | `/checkout/course/[courseSlug]`, `/checkout/bundle/[bundleSlug]`, `/payment/[orderId]`, `/account/orders` | Stub |
| 5 | Learning | `/dashboard`, `/learn/[courseSlug]`, `/learn/[courseSlug]/[lessonSlug]` | Stub — see Open Design Questions |
| 6 | Project | `/projects`, `/projects/[username]/[slug]`, `/projects/me`, `/projects/me/[projectId]` | Stub |
| 7 | Admin | `/admin`, `/admin/courses`, `/admin/bundles`, `/admin/users`, `/admin/orders`, `/admin/projects` | Stub |
| — | Cross-cutting | Global nav, `/` (Homepage), `/account` | Nav detailed below; Homepage built incrementally per wave |

## Cross-cutting / Global Navigation

Not a route — this is shared chrome that every screen above renders inside. Documented here once instead of repeated per screen.

**Header nav**
- Guest state: logo → `/courses`, `/bundles`, `/projects` links → "Masuk" (→ `/login`) / "Daftar" (→ `/register`) buttons.
- Authenticated state: logo → same nav links → account avatar/dropdown (right side).

**Account dropdown (authenticated only)**
- Links: `/dashboard`, `/account`, `/account/orders`.
- **Sign out** — not a route, an action. Calls Clerk `signOut()`, redirects to `/`. Satisfies IAM-002's logout requirement. Flagged explicitly here so it doesn't get missed when the nav component is built — it has no page of its own, so it won't show up in any route-by-route spec otherwise.

**Not yet decided:** mobile nav pattern (hamburger vs bottom bar) — defer to whichever wave first needs a real mobile layout test, don't speculate now.

## Wave 2 — Identity (brief; already implemented)

| Route | Access | Requirement | Notes |
|---|---|---|---|
| `/login` | Guest | IAM-002, IAM-005 | Clerk `<SignIn />`, Google + email/password. |
| `/register` | Guest | IAM-001, IAM-005 | Clerk `<SignUp />`. |
| `/forgot-password` | Guest | IAM-003 | Clerk recovery flow. |

No further spec needed — these use Clerk's prebuilt components per the Fase 3 prompt, minimal DESIGN.md styling only.

## Wave 3 — Catalog

### `/courses` — Course Catalog

- **Access:** Guest + Learner
- **Requirement:** CAT-001, CAT-006
- **Layout:** header nav → course grid (no filter/sort in P0 — MVP course count is small enough that discovery doesn't need it yet; revisit once Appendix A's lineup grows) → pagination or infinite scroll (defer choice to implementation, not a product decision)
- **States:**
  - Loading: skeleton grid (card-shaped placeholders, count matches expected grid columns)
  - Empty: no course has `status = PUBLISHED` yet (admin hasn't published anything) — show a calm empty state, not a broken-looking blank grid
  - Populated: grid of course cards
- **Course card content (per DESIGN.md 5.4):** category tag, title, one-line outcome description, difficulty, duration estimate, price, ownership badge (CAT-006 — only rendered for authenticated learners who already hold an ACTIVE/COMPLETED enrollment for that course)
- **Actions:** click card → `/courses/[slug]`

### `/courses/[slug]` — Course Detail

- **Access:** Guest + Learner
- **Requirement:** CAT-002, CAT-003, CAT-006
- **Layout:** hero (title, final-result preview, price, primary CTA) → "Apa yang akan kamu bangun" / "Apa yang akan kamu pelajari" → curriculum outline (stage → lesson titles only, no content — content is gated behind enrollment per LRN-006) → requirements → secondary CTA at the bottom of the page
- **States:**
  - Not found / not published: a guest hitting an UNPUBLISHED or nonexistent slug gets a real 404, not a broken page — CAT-003 is explicit that unpublished courses stop new discovery/purchase
  - Guest, not logged in: CTA reads "Mulai Merakit" (4.5 vocabulary), click triggers auth if needed before checkout (Journey A step 3)
  - Learner, doesn't own: same CTA, goes to `/checkout/course/[slug]` (Wave 4)
  - Learner, already owns: CTA changes to "Lanjut Merakit", goes straight to `/learn/[slug]` (Wave 5) — this is CAT-006's ownership indicator applied at the CTA itself, not just a badge
- **Actions:** primary/secondary CTA as above

### `/bundles` — Bundle Catalog

- **Access:** Guest + Learner
- **Requirement:** CAT-005
- **Layout:** header nav → bundle card grid
- **States:**
  - Empty: no bundle currently `ACTIVE` and within its campaign window — this is a normal, expected state (bundles are campaign-driven, not always-on), not an error
  - Populated: bundle cards
- **Bundle card content:** title, type (`FIXED` shows included course count; `CHOOSE_N` shows "pilih N dari M course"), price
- **Acceptance note (CAT-005):** every currently-ACTIVE bundle must be discoverable here without knowing its slug — this page is the actual enforcement of that requirement, not just a nice-to-have
- **Actions:** click card → `/bundles/[slug]`

### `/bundles/[slug]` — Bundle Detail

- **Access:** Guest + Learner
- **Requirement:** CAT-005, COM-004, COM-005, COM-007 (pointer only — full checkout logic is Wave 4, this screen only covers selection/display)
- **Layout:** hero (title, type, price) → course list:
  - `FIXED`: included courses shown as a plain list, nothing to select
  - `CHOOSE_N`: eligible courses shown as selectable cards with a running counter ("2/3 dipilih"), already-owned courses shown but disabled/excluded from selection (10.8)
- **States:**
  - Bundle not ACTIVE / outside campaign window: not purchasable — show why, don't just hide the CTA silently
  - `CHOOSE_N`, learner doesn't have enough eligible unowned courses to reach N: bundle is not purchasable for this learner specifically (10.8) — this is a per-learner state, not a bundle-level one, and it's easy to forget since it only shows up for learners who already own several of the eligible courses
  - Valid selection reached: CTA enabled
- **Actions:** select/deselect course (CHOOSE_N only) → CTA to `/checkout/bundle/[slug]` (Wave 4) once selection is valid

## Wave 4–7 — Stubs

Routes listed in the Wave map table above. Not detailed yet — filled in when each wave starts, same format as Wave 3.

## Open design questions

- **Video/text content-block model (flagged during Wave 3 discussion, belongs to Wave 5).** `lessons.content` is JSONB holding an ordered list of blocks (text/markdown, code, image, video-ref, resource-link, task) per LRN-004 — mixed content within one lesson is compositional, not a per-lesson type choice. Still open: the schema also has a separate top-level `lessons.videoProviderId` field. Decide before Wave 5 whether that's the lesson's single "primary/hero" video (used for e.g. DEMO-type lessons) with `content` handling any secondary video, or whether it should be removed in favor of video being purely a block type inside `content` with one source of truth. Not urgent now — doesn't block Wave 3 or 4.
- **Mobile nav pattern** — see Cross-cutting section above.
