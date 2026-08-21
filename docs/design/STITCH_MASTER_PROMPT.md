# DirakitPro — Google Stitch Master Prompt

This document is reusable context for generating DirakitPro screens in Google Stitch. It is split into three parts: a Master Product Context (paste on every screen), a Screen Prompt Template (fill in per screen), and Iteration Rules (how to work with Stitch across a session). It assumes Session 2 has not yet locked a single visual direction — see the note in Part A.

---

## Part A — Master Product Context

Paste this block at the start of every Stitch conversation, before any screen-specific prompt from Part B. It should not change between screens within a session.

```text
PRODUCT: DirakitPro — an outcome-first learning platform for beginners in
Indonesia. Brand philosophy: "Profesional itu dirakit" (professional
quality is assembled progressively, not instant). Beginner promise:
"Mulai dari rakitan pertama" (start with your first build).

WHAT THE PRODUCT IS NOT: a generic Udemy-style course marketplace, a
corporate LMS, a school/university portal, a crypto dashboard, a hacker
terminal aesthetic, or a children's education app. Learners buy outcomes
(a real website/app/dashboard they can show), not video playlists.

AUDIENCE: ages ~18-30, Indonesia, beginner or early-stage learner —
students, fresh graduates, career switchers, non-technical people
exploring digital products, early junior developers. They should feel
"I might not be an expert yet, but I can start" — never "this is only
for senior programmers."

DESIGN PRINCIPLES (apply to every screen):
- Outcome before curriculum — show what will be built before the syllabus.
- Progress should always feel visible and specific, never vague.
- Beginner-friendly without being childish — no cartoon mascots, no toy UI.
- Real project output (screenshots) is the hero visual, not stock photos
  or illustrations of people.
- One dominant accent color (blue) — never a rainbow UI.
- The learning workspace is calmer/quieter than marketing pages.

COLOR SYSTEM (mandatory brand anchors — do not substitute):
  brand-50  #E3F2FD   soft backgrounds, info panels, progress zones
  brand-200 #90CAF9   secondary accents, hover states, illustration lines
  brand-500 #2196F3   primary interactive accent, links, progress fill
  brand-900 #0D47A1   high-emphasis headings, dark sections, active states
Full derived scale (100/300/400/600/700/800) is available if intermediate
stops are needed — interpolate along the same blue hue, do not introduce
a second brand hue.
Neutrals: cool-leaning grays (white to near-black, e.g. #F6F8FB through
#1B2029) must be the MAJORITY surface color on every screen. Never make
backgrounds, cards, AND buttons all blue on the same screen.
Semantic colors: muted green for success, warm amber for warning,
restrained red for danger/error — used sparingly, never competing
visually with the brand blue.

TYPOGRAPHY: Plus Jakarta Sans for all headings and body text. JetBrains
Mono for code, URLs, order IDs, and technical labels only. Do not
introduce additional font families.

RADIUS: 6-16px depending on element size (small controls smaller radius,
large cards larger radius). Buttons default to a moderate rounded-
rectangle radius (~10px) — NOT fully pill-shaped by default. Pill shapes
are reserved for small status badges/tags only.

ELEVATION: prefer a 1px border plus very subtle shadow over heavy
floating-card shadows. The product should feel structured and grounded,
not like a stack of dashboard widgets hovering above the page.

ICONOGRAPHY: simple outline icons (Lucide-style), consistent stroke
width, functional not decorative.

IMAGERY: primary imagery must be realistic representations of ACTUAL
PROJECT SCREENSHOTS / product interfaces that a beginner might build
(personal websites, finance trackers, booking apps) — not generic stock
photography of people, and not abstract illustration as the primary
visual.

ILLUSTRATION (when used at all): modular blocks, layers, connection
lines, subtle blueprint-style annotations, rendered in the blue palette.

MOTION (describe only, static concepts are fine for Stitch): motion
communicates assembly/progress/completion — a block settling into place,
a progress bar filling, a connector line drawing — never bouncing,
spinning decoration, or constant looping animation.

FORBIDDEN STYLES — DO NOT GENERATE:
- generic SaaS dashboard look (indistinguishable from a generic B2B tool)
- purple or purple-blue gradients
- excessive glassmorphism / frosted blur panels
- random decorative gradients
- excessive pill-shaped buttons/cards everywhere
- graduation caps, cartoon classrooms, mortarboard iconography
- construction/wrench/gear/factory/circuit-board imagery
- stock photography of people holding oversized laptops
- painting entire screens in blue (blue must be an accent, not a fill)
- confetti or heavy gamification treatments

This context is shared across three candidate visual directions being
explored in parallel (Modern Maker, Digital Workshop, Editorial
Builder) — when a screen prompt below specifies one of these directions,
apply that direction's specific mood/layout/color-weighting rules from
docs/design/visual-directions/ on top of this shared foundation.
```

---

## Part B — Screen Prompt Template

Fill in every field for a single screen at a time. Never combine unrelated screens in one generation request (see Part C).

Screen prompts must use routes defined in `SCREEN_INVENTORY.md` and the LOCKED PRD. Do not invent navigation routes. A design may introduce tabs, detail views, drawers, editors, or other screen states inside an existing PRD route — exact implementation URLs for such states are intentionally deferred to the architecture phase. If a screen calls for something like a course edit view or a payments filter, frame it as a screen state/sub-view of its PRD route (e.g. "the configuration state of `/admin/courses`"), not as a new route name.

```text
SCREEN:
ROUTE:
USER:
PURPOSE:

PRIMARY ACTION:
SECONDARY ACTION:

REQUIRED SECTIONS:
(list every content block that must appear, in order — pull directly
from docs/design/SCREEN_INVENTORY.md's "Key Components" for this route)

KEY COMPONENTS:
(name each reusable component involved — e.g. "Course Card",
"Build Progress — Vertical Assembly Timeline candidate", "Project
Result" — and reference docs/design/DESIGN.md §17-18 for their rules)

STATES:
(explicitly request the empty / loading / error state variants that
apply, per SCREEN_INVENTORY.md — do not let Stitch default to only the
happy path)

MOBILE REQUIREMENTS:
(pull from DESIGN.md §19 and the screen's "Mobile priority" note —
e.g. "must collapse curriculum sidebar into a bottom drawer on mobile")

VISUAL RULES:
(the specific direction being tested — e.g. "Apply Direction B: Digital
Workshop — dark brand-900 band in the hero, blueprint corner-bracket
accents on cards, vertical timeline progress style")

PRD REFERENCES:
(requirement IDs from DirakitPro_MVP_PRD_V1.0.md, for traceability —
e.g. "CAT-002, CAT-006, COM-001")

DO NOT:
(screen-specific negatives beyond the master forbidden-styles list —
e.g. for Course Detail: "do not lead with an instructor photo; do not
hide the price above the fold")
```

**Worked example** (Course Detail, Direction A):

```text
SCREEN: Course Detail
ROUTE: /courses/[slug]
USER: Guest and Learner
PURPOSE: Convert a visitor into a buyer by leading with the outcome,
then curriculum, then price.

PRIMARY ACTION: "Mulai Merakit" button
SECONDARY ACTION: Curriculum preview; if owned, show "Lanjut Merakit"
instead

REQUIRED SECTIONS: outcome hero with real project screenshot, what-you-
will-build summary, what-you-will-learn summary, curriculum outline
(stage/lesson list), requirements, price + CTA panel

KEY COMPONENTS: Course outcome hero, curriculum list (modular tile
style per Direction A), sticky price/CTA panel (desktop), ownership
indicator badge

STATES: default (guest, not owned); owned (show Lanjut Merakit instead
of purchase CTA); loading skeleton for hero + curriculum

MOBILE REQUIREMENTS: price/CTA panel becomes a bottom-anchored bar on
mobile rather than a sticky side panel; curriculum list stays single
column

VISUAL RULES: Apply Direction A — Modern Maker: light brand-50 hero
wash, modular rounded-tile curriculum list, radius-lg on hero container,
warm/approachable type weight

PRD REFERENCES: CAT-002, CAT-003, CAT-004, CAT-006, COM-001

DO NOT: lead with an instructor photo; hide price below an extra scroll
on mobile; use a dense accordion that hides the outcome preview
```

---

## Part C — Stitch Iteration Rules

```text
Generate → Screenshot → Review → Remediation Prompt → Regenerate → Lock
```

- **One screen per generation.** Never ask Stitch to produce multiple unrelated screens (e.g. homepage + admin dashboard) in a single pass — it dilutes attention and makes remediation ambiguous about which screen a fix applies to.
- **Always re-paste Part A's Master Product Context** at the start of a new Stitch conversation/session, even if it was used earlier in the same working day — don't rely on Stitch's memory carrying brand rules forward correctly.
- **Screenshot every result** before writing a remediation prompt, and reference specific visual elements in the remediation ("the hero background is using a purple gradient, replace with a flat brand-50 wash" rather than "make it more on-brand").
- **Remediation prompts are additive corrections**, not full re-briefs — restate only what's wrong and what it should become; re-sending the entire Part A + Part B block on every remediation round causes drift.
- **Lock a screen only after it satisfies**: correct color usage (blue as accent, not fill), correct typography, no forbidden-style violations, all required states requested, and mobile requirement addressed. A "locked" screen becomes the visual reference for any other screen that shares its components (e.g. once a Course Card is locked, don't regenerate its visual language from scratch on the Catalog page).
- **Cross-direction exploration stays separate.** When testing Direction A vs. B vs. C on the same screen (e.g. Homepage), run three fully separate Stitch threads rather than asking Stitch to "try a different style" mid-thread — this avoids visual bleed between directions and keeps each direction's concept board honest for the evaluation matrix in the visual-direction docs.
- **Never let Stitch invent product behavior.** If a generated screen implies a flow or rule not in `DirakitPro_MVP_PRD_V1.0.md` (e.g. a coupon code field, a "save for later" button, a review/rating widget), flag it and remove it in the remediation pass — Stitch should visualize the locked PRD, not extend it.

---

## Usage Note

This file supports Design Session 2 (Visual Direction Selection & Core Screen Exploration). The four Wave 1 signature screens — Homepage, Course Detail, Learner Dashboard, Learning Workspace — are the recommended starting point, generated once per candidate direction (A/B/C) using the mini-concept prompts already included at the bottom of each `visual-directions/DIRECTION_*.md` file, before moving on to full per-screen prompts using the template in Part B.
