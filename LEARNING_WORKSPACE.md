# DirakitPro — Learning Workspace Deep-Dive (Wave 5)

| Field | Value |
|---|---|
| Status | **v1 — draft, not yet built** |
| Last updated | 24 August 2026 |
| References | `DirakitPro_MVP_PRD_V1.0.md` (internal V1.3) §8.4–8.5, §9, §10.5–10.7, §12.2; `DESIGN.md`; `SCREEN_INVENTORY.md` |
| Scope | `/dashboard`, `/learn/[courseSlug]`, `/learn/[courseSlug]/[lessonSlug]` — flagged from the start as needing more than a `SCREEN_INVENTORY.md` entry, this is that deep-dive. |

Two systems are easy to conflate here and shouldn't be: **Lesson Progress** (did you consume this piece of content — NOT_STARTED/STARTED/COMPLETED, LRN-005) and **Build Progress** (how much of the actual thing you're building is done — BLD-001–004). Every section below keeps them visually and structurally separate, because BLD-003 requires Build Progress to read as the dominant signal, not a footnote next to lesson checkmarks.

## 1. `/dashboard`

**Requirement:** LRN-001.

- **Access:** Learner only.
- **Layout:** list of enrolled courses. Per course: title, Build Progress (large, dominant — this is the primary visual, not a small bar), current stage name, single CTA **"Lanjut Merakit"**.
- **Resume logic (decision, not in PRD — flagging my default):** "Lanjut Merakit" jumps to the first lesson in stage/position order that is not yet `COMPLETED`. If every lesson is `COMPLETED`, land on the last lesson instead of erroring — the course-completion state (10.7) is what tells the learner they're fully done, this button shouldn't need a special case for it.
- **States:** empty (account has zero enrollments — plausible right after signup, before any purchase; CTA here should point to `/courses`, not render a blank dashboard), populated.

## 2. `/learn/[courseSlug]` — Course start/overview

Not the same page as `/courses/[slug]` (public catalog detail, Wave 3) — this is the enrolled-only workspace entry, and it's where **LRN-007's course-level resources live**, since they need to stay visible "from anywhere in the workspace," not buried inside one lesson.

- **Access:** Learner with an ACTIVE/COMPLETED enrollment for this course only. No enrollment → this is not a 404 (the course exists) and not the same as CAT-003's unpublished-course 404 — redirect to `/courses/[slug]` instead, since the honest state is "you haven't bought this."
- **Requirement:** LRN-002, LRN-007.
- **Layout:** stage → lesson outline (the full curriculum, not the title-only summary Wave 3 showed on the public page — this version shows per-lesson progress state), Build Progress summary, course-level resources block (repo/assets/links, LRN-007), single CTA into the resume lesson (same resume logic as `/dashboard`).
- **States:** normal (enrolled, content available); course was UNPUBLISHED after enrollment (LRN-006 — access must be unaffected, this page still renders normally, just don't surface it via Catalog anymore — that's already handled by Wave 3's CAT-003 logic, not something this page needs to re-check).

## 3. `/learn/[courseSlug]/[lessonSlug]` — the workspace itself

**Requirement:** LRN-002, LRN-003, LRN-004, LRN-005, LRN-007, BLD-002, BLD-003.

### 3.1 Layout regions

- **Persistent sidebar** (stage/lesson navigation): collapsible per stage, each lesson shows a small status indicator (not started / in progress / completed) — small and secondary, this is Lesson Progress, not Build Progress. Current lesson highlighted.
- **Header area**: Build Progress bar — large, teal (`DESIGN.md` 5.2), always visible regardless of scroll position. This is the BLD-003 "dominant" placement. Link out to the course-level resources (LRN-007) lives here too, not inside the content pane, so it's reachable from every lesson without hunting for it.
- **Content pane**: renders the `content` block array in order (Appendix G). One renderer component per block type — `markdown`, `code`, `image`, `video` (embeds by `provider` — for MVP that's always `youtube`, per Appendix F), `resource_link`, `task`.
- **Footer/bottom of content pane**: lesson completion action + prev/next lesson navigation.

### 3.2 Lesson completion mechanism (decision, not specified in PRD — flagging my default)

10.5 says completion must be idempotent but doesn't say what triggers `STARTED → COMPLETED`. Auto-detecting "consumption" (scroll position, video watch time) adds real complexity for a signal the product doesn't actually prioritize — Build Progress is what's supposed to matter (BLD-003), not content-consumption tracking. **Default: one uniform "Tandai selesai" (mark complete) button at the bottom of every lesson's content pane**, regardless of lesson type. Same mechanism for CONCEPT/DEMO/BUILD; CHECKPOINT and DEPLOY are special cases below.

### 3.3 Lesson type-specific behavior (LRN-003)

| Type | Behavior in workspace |
|---|---|
| CONCEPT / DEMO | Content pane renders blocks, "Tandai selesai" button as above. |
| BUILD | Same as above — the block content is the instruction; the actual building happens outside DirakitPro (in the learner's own code editor). |
| CHECKPOINT | Self-reported completion, not automated verification — DirakitPro doesn't inspect the learner's code/deployment. The `task` block renders as a checklist; "Tandai selesai" only enables once every task item in the block is checked. Completing a REQUIRED CHECKPOINT lesson is what drives `BuildMilestone` completion (BLD-002 acceptance) — the milestone itself is never marked complete by a direct learner action, it's fully derived. |
| DEPLOY | **Flagging a real sequencing gap, not deciding it silently:** DEPLOY's PRD description ("Deploy and submit URL") sounds exactly like `ProjectSubmission` (Wave 6 — `liveUrl`, `repositoryUrl`), which doesn't exist yet. For Wave 5: treat DEPLOY lessons as informational only (instructions + "Tandai selesai"), and don't build any URL-submission UI here. The real submission flow belongs on `/projects/me/[projectId]` once Wave 6 exists — building a duplicate/temporary submission mechanism now would just get thrown away. |

### 3.4 Access & guards

- No enrollment → same redirect-to-catalog behavior as §2, not a 404 or error page.
- Enrollment exists but course later UNPUBLISHED → still accessible (LRN-006), no special-case needed here.
- Lesson doesn't belong to this course, or doesn't exist → `notFound()`.

## 4. Cross-wave dependency (already known, restated here for this file's own record)

Course `COMPLETED` (10.7) needs all REQUIRED lessons done + all Build Milestones done + final Project `SUBMITTED`. Wave 5 can fully build and test the first two conditions. The third can't be exercised end-to-end until Wave 6 exists — expected, not a defect of this wave.

## 5. Open items — deliberately not decided here

- Exact visual treatment of the sidebar on mobile (collapse pattern) — implementation detail, not a product decision, leave to whoever builds it against `DESIGN.md` tokens.