# DirakitPro — Project & Showcase Deep-Dive (Wave 6)

| Field | Value |
|---|---|
| Status | **v1 — draft, not yet built** |
| Last updated | 25 August 2026 |
| References | `DirakitPro_MVP_PRD_V1.0.md` §8.6 (PRJ-001–010), §10.6–10.7, §12.1–12.2; `DESIGN.md`; `CLAUDE.md` |
| Scope | `/projects/me`, `/projects/me/[projectId]`, `/projects` (already speced in PRD text, restated briefly), `/projects/[username]/[slug]` |

Four independent states on one entity, easy to conflate — every section below is explicit about which one it's touching:

| Axis | Values | Who controls it |
|---|---|---|
| Workflow | `DRAFT` → `SUBMITTED` | Learner (via valid submission) |
| Visibility | `PRIVATE` / `PUBLIC` | Learner |
| Moderation | `UNREVIEWED` / `APPROVED` / `REJECTED` / `HIDDEN` | Admin (Wave 7) |
| Featured | flag | Admin (Wave 7) |

## 1. `/projects/me` — learner's own projects

**Requirement:** PRJ-001.

- **Access:** Learner only.
- **Layout:** one row per Project (auto-created per ACTIVE enrollment, PRJ-001 — a learner never sees an "empty" state here if they have any enrollment). Per row: course title, workflow badge (Draft/Submitted), visibility badge (only shown if PUBLIC), link into `/projects/me/[projectId]`.
- **States:** empty only if zero enrollments (shouldn't normally happen — CTA to `/courses` same as dashboard's empty state); populated.

## 2. `/projects/me/[projectId]` — edit, submit, publish

**Requirement:** PRJ-001–005, PRJ-009. The most decision-dense screen in this wave.

### 2.1 Fields

| Field | Required to reach SUBMITTED? | Notes |
|---|---|---|
| Live URL | Yes | `http(s)` validated (PRJ-002) |
| Repository URL | No | `http(s)` validated when present |
| Screenshot URL | **Yes** | `http(s)` validated — pasted URL, not upload (PRJ-002 acceptance, confirmed this session) |
| Notes | Yes | Free text |
| Title | No | Defaults to the course title; learner can override for a more personal showcase title (PRJ-008 lists title as showcase content — a portfolio piece reads better with the learner's own framing than a literal copy of the course name) |
| Description | No | Free text, shown publicly (PRJ-008) |
| Features | No | List of short strings, learner-authored |
| Technologies | No | List of short strings, learner-authored |

**10.6 confirms:** live URL, screenshot, and notes are what gate `DRAFT → SUBMITTED` — repository URL stays optional even at `SUBMITTED`. Title/description/features/technologies are showcase polish, not submission gates.

### 2.2 Visibility & publication (PRJ-003, PRJ-004)

- Visibility toggle (`PRIVATE`/`PUBLIC`) **only enabled once workflow is `SUBMITTED`** — decision, not stated explicitly in PRD, flagging my default: publishing an incomplete `DRAFT` publicly doesn't match the intent of a showcase.
- Setting `PUBLIC` requires checking a publication declaration first (PRJ-004) — exact copy, also not specified in PRD, my default: *"Saya menyatakan project ini adalah hasil kerja saya sendiri dan setuju untuk ditampilkan secara publik di DirakitPro."* Unchecking this box (or switching back to `PRIVATE`) doesn't need re-declaration to go public again in the same session, but going `PRIVATE → PUBLIC` again after a prior un-publish should re-show the checkbox, not silently reuse an old consent.
- Going `PUBLIC` immediately sets moderation to `UNREVIEWED` and the direct link is live right away (PRJ-004) — the learner should see this stated plainly in the UI (something like "your project is live at this link now — it just won't appear in the curated gallery until an admin reviews it"), not buried.

### 2.3 Ownership guard

Same pattern as `/payment/[orderId]` (Wave 4) — not the owner, or project doesn't exist → `notFound()`, no distinction visible between the two (PRJ-003, server-side enforcement).

### 2.4 Read-only moderation display

Moderation state and reason (if `REJECTED`/`HIDDEN`) are visible to the owner but never editable here — that's Wave 7's surface, not this one.

## 3. `/projects` — curated public gallery

Already fully speced in PRD text (PRJ-006, PRJ-007) — restated briefly since it's easy to forget: **this will render empty through all of Wave 6**, because it requires `APPROVED` + `FEATURED`, and nothing sets those until Wave 7 exists. Not a defect to fix in this wave.

## 4. `/projects/[username]/[slug]` — public showcase

**Requirement:** PRJ-007, PRJ-008, PRJ-009, PRJ-010.

- **Access rule (PRJ-007):**
  - `PRIVATE` → `notFound()`, regardless of viewer (including the owner — they use `/projects/me/[projectId]` for their own view, not this route).
  - `PUBLIC` + `UNREVIEWED` → renders normally, but page metadata sets `robots: noindex`.
  - `PUBLIC` + `APPROVED` → renders normally, indexable.
  - `PUBLIC` + `HIDDEN`/`REJECTED` → `notFound()` — PRJ-007 is explicit these must not appear on any discovery surface, and a live direct link would defeat that.
- **Content (PRJ-008):** title, author display name (verify exact source field against the `users` schema when implementing — likely `username`, confirm no separate display-name field was added), screenshot, description, features, technologies, live URL, attribution ("Dibangun di DirakitPro" or similar).
- **Share actions (PRJ-009):** copy-link button; a generic share trigger (Web Share API where available); an explicit LinkedIn share link as the named minimum from the requirement.
- **OG metadata (PRJ-010):** dynamic per project (title + screenshot as the OG image) — same Next.js Metadata API pattern as the logo/OG work discussed earlier in this project, applied per-project instead of site-wide.
- **`[slug]` note:** Project doesn't have an obvious natural slug the way a Course does — verify in Fase 1 (schema check) whether `projects` already has a `slug` column; if not, that's a small additive migration (auto-generate from title, unique per user), not a design decision that needs to happen here.

## 5. Open items — deliberately not decided here

- Exact publication-declaration copy (§2.2) — my draft is a reasonable default, not final marketing/legal copy.
- Whether re-publishing after un-publishing needs fresh consent (§2.2) — flagged, not resolved.