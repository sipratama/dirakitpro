# DirakitPro — Curriculum Management Deep-Dive (Wave 7b-ii)

| Field | Value |
|---|---|
| Status | **v1 — draft, not yet built** |
| Last updated | 25 August 2026 |
| References | `DirakitPro_MVP_PRD_V1.0.md` §8.7 (ADM-003), Appendix G (content-block model), §9; `LEARNING_WORKSPACE.md` (the renderer this editor must stay compatible with) |
| Scope | Stage, lesson, and content management for a single course; BuildMilestone management and linking. |

PRD gives one explicit simplification: **drag-and-drop is not required (ADM-003)**. Everything below leans on that — ordering via a plain position number or up/down buttons, not a drag interface.

## 1. Where this lives

Nested under the course it belongs to, not a top-level `/admin` section: `/admin/courses/[courseId]/curriculum`.

## 2. Stage & lesson metadata

- **Stages:** title, position (number field or up/down buttons). Add/remove/reorder.
- **Lessons (within a stage):** title, slug, type (CONCEPT/DEMO/BUILD/CHECKPOINT/DEPLOY), `isRequired`, position, `buildMilestoneId` (dropdown of this course's milestones — only meaningful for CHECKPOINT, but don't hide it for other types; an admin might reasonably plan ahead).
- Standard CRUD forms — nothing here is a new pattern, same shape as Course/Bundle management (Wave 7b-i).

## 3. Content editing — the actual design decision

This is the one part of ADM-003 that isn't a standard form, and it's worth deciding deliberately rather than defaulting to the heaviest option.

**Two ways to build this:**

- **(a) Full visual block editor** — a mini-form per content-block type (markdown textarea, code textarea + language field, image URL + alt, video provider + ID, resource-link label + URL, task checklist item add/remove), with add/remove/reorder controls for the block array itself.
- **(b) Structured JSON textarea + live preview** — admin edits the `content` array as JSON directly, validated against the same `ContentBlock` type from Wave 5 (`apps/web/features/learning/content-block.ts`) on save, with a live preview panel that renders it through the **existing** `ContentBlockRenderer` component (Wave 5) — so what the admin sees while editing is pixel-identical to what a learner will see, not a separate preview implementation to keep in sync.

**Recommendation: (b).** Reasoning: the only content author right now is a technical solo founder who's already been comfortable authoring this exact shape of data directly in `seed.ts` all through this project — a JSON editor asks nothing new of that workflow, just moves it from a code file into an admin page (no deploy required to publish a change, which is the actual point of ADM-003). A full per-type visual editor is real, nontrivial UI work for six different block types, justified once there's a second content author who isn't comfortable with structured data — not justified now. Reusing the Wave 5 renderer for the preview is what makes option (b) safe rather than a bare textarea: validation errors and rendering mistakes surface immediately, in the same component that ships to learners.

**If this changes:** swapping to (a) later is additive, not a rewrite — the underlying data shape doesn't change, only the editing surface. Worth revisiting once/if a second person is authoring content.

## 4. BuildMilestone management

- Per course: title, position, `isRequired`. Add/remove/reorder — same shape as stages.
- No direct "mark complete" action here (that's still fully derived from CHECKPOINT lesson completion, BLD-002 — this page manages the milestone's existence and metadata, not its completion state, which was already decided in Wave 5 and doesn't change here).

## 5. Open items — deliberately not decided here

- Whether editing a PUBLISHED course's curriculum should warn the admin that enrolled learners are actively using it (no PRD requirement either way) — flagging as a UX nicety to consider, not blocking.
- JSON schema validation error presentation (inline per-field vs a single error block) — implementation detail, not a product decision.