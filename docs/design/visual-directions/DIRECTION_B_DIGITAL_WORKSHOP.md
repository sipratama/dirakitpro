# Visual Direction B — Digital Workshop

## Name

Digital Workshop

## Concept

The most structured and "serious" of the three directions, without becoming intimidating. DirakitPro presented as a real workshop where a real product is being built: grid-based layouts, blueprint-inspired detailing, modular systems that visibly connect, and confident use of the darkest brand blue. This direction is the strongest bridge from Beginner to the eventual Understand → Engineer → Production → Scale ladder (PRD §19.1).

## Mood

Structured, technical-but-approachable, deliberate, confident. Heavier visual weight than Modern Maker — more grid lines, more annotation detail, more use of brand-900 — but never cold or corporate.

## Brand Interpretation

The "dirakit" metaphor shows up as **blueprint annotation and connected systems**: thin guide lines, small corner brackets on cards (like a technical spec sheet), step numbers presented like schematic callouts, and Build Progress rendered as a connected circuit/timeline rather than soft tiles. This is the direction that takes the assembly metaphor most literally in *structure* (grids, connections, annotations) while still explicitly avoiding literal tool/machinery imagery per DESIGN.md §15.

## Color Usage

Strong, deliberate use of `#0D47A1` (brand-900) — dark blue section backgrounds on the homepage (e.g. a dark "how it works" band), dark sidebar/header treatment in the learning workspace, and brand-900 as the default heading color rather than neutral-900. Brand-500 is reserved tightly for interactive elements and progress fills, so it reads as purposeful rather than decorative. Neutrals lean slightly cooler/darker than the system default (more neutral-700/800 in body copy) to match the more technical register. Semantic colors are the most restrained of the three directions — success/warning/danger appear only as small indicators, never as large surface fills, keeping the "workshop" feeling calm and instrumented rather than alert-heavy.

## Typography Intent

Plus Jakarta Sans at full system weight (700 headings), slightly tighter line-height than Modern Maker for a denser, more technical feel. JetBrains Mono gets more visible usage here than in the other directions — stage/step numbers, milestone IDs, and technical annotations are set in mono to reinforce the "spec sheet" read.

## Layout Characteristics

Strict grid alignment is visible, not just used internally — thin hairline guides or corner brackets on hero sections and cards make the grid itself part of the aesthetic (a restrained blueprint cue). Sections are denser than Modern Maker; more content is visible without scrolling, appropriate for a slightly more capable/committed learner audience once they're past the very first onboarding moment.

## Card Style

`radius-sm`–`radius-md` (tighter than Modern Maker), 1px border with a small corner-bracket accent (a short line at two opposite corners, like a technical crop mark) rather than a full shadow. Bundle and admin-adjacent cards suit this direction particularly well.

## Progress Visualization

Leans into **Candidate 1 — Vertical Assembly Timeline** from DESIGN.md §18.1: a connected line with step nodes, annotated with step numbers in mono type, and a fill that reads like a circuit completing. This is the most natural home for that representation, since it matches the direction's blueprint/schematic register.

## Homepage Treatment

Hero sits on a dark brand-900 band with brand-200 accent line-work and a real project screenshot presented like a "spec sheet exhibit" (thin frame, small caption below in mono). A distinct dark "how it works" section (Discover → Build → Complete → Showcase) uses the connected-timeline visual language directly. Featured courses transition back to a light neutral-50 section to avoid the whole page feeling heavy.

## Course Detail Treatment

Curriculum presented as a structured, numbered outline with visible stage/lesson hierarchy (closer to a technical spec than a friendly list) — annotated with lesson-type icons and mono step numbers. Build milestones for the course are shown up front as a preview of the assembly timeline the learner will walk through.

## Learning Workspace Treatment

This direction's workspace is the most "serious" of the three — a persistent left sidebar (desktop) rendered in a darker neutral tone with the vertical assembly timeline as the primary navigation and progress artifact, content pane in a calm, high-contrast neutral-0/50 field. This is deliberately the most "I am building something real" workspace of the three directions.

## Advantages

Strongest, most distinctive brand differentiation of the three — least likely to be confused with a generic course platform. Best natural fit for the Build Progress signature component. Scales cleanly into the professional tiers (Understand/Engineer/Production/Scale) without needing a visual overhaul later.

## Risks

**Risk: looking too engineering-heavy, alienating a true non-technical beginner.**

**How this direction stays beginner-friendly:**
- Blueprint/annotation details are used as *accents* (corner brackets, thin guide lines, mono step numbers) — never as dense technical diagrams, wiring schematics, or anything resembling actual engineering documentation.
- Copy tone stays exactly per DESIGN.md §21 — plain, encouraging Bahasa Indonesia — regardless of how structured the surrounding visual system is. The structure is in the *layout*, not the *language*.
- The homepage and course-discovery surfaces (a true beginner's first touchpoint) intentionally use lighter neutral-50 sections, saving the heaviest brand-900 treatment for "how it works" storytelling and the in-progress workspace, where the learner has already committed and structure reads as reassuring rather than intimidating.
- Illustration and iconography stay simple outline style (DESIGN.md §13/§15) even within the blueprint motif — no dense schematic art.

## When It Works Best

The learning workspace, course curriculum/detail depth, Build Progress specifically, and any surface aimed at a learner who has already purchased and is mid-build — where "this feels like real, structured work" is a feature, not a barrier.

---

## Stitch Exploration Prompt

```text
Generate a mini visual concept for "DirakitPro," an outcome-first learning
platform for beginners in Indonesia. Direction: "Digital Workshop" —
structured, technical-but-approachable, blueprint-inspired, confident use
of dark blue, bridging beginner to professional.

Produce exactly these four elements in one cohesive concept board:
1. Homepage hero on a dark blue (#0D47A1) band, with a real-project-
   screenshot-style visual framed like a spec exhibit, thin light-blue
   accent line work, headline + subheadline in Indonesian, one CTA button
2. A course card with a small corner-bracket accent detail, build-outcome
   preview image first, title, difficulty + duration + price row
3. A Build Progress component as a vertical connected timeline with
   numbered step nodes (mono numerals), clearly showing Completed /
   Current / Upcoming / Optional states via shape, not color alone
4. A dashboard preview with a dark sidebar navigation and a light content
   area showing 2-3 enrolled courses with the timeline progress style

Color palette (mandatory): brand-50 #E3F2FD, brand-200 #90CAF9,
brand-500 #2196F3, brand-900 #0D47A1, plus cool neutrals as the majority
surface color outside the dark band. Do not paint every surface blue —
use brand-900 deliberately for a small number of strong sections, not
everywhere.

Typography: Plus Jakarta Sans for headings/body, JetBrains Mono for step
numbers and technical labels. Radius: 6-10px, tighter/more structured
than a typical consumer app. Elevation: border + corner-bracket accent
rather than shadow-heavy cards.

Do not: use purple, use literal wiring/circuit-board diagrams, use
construction/wrench/gear imagery, use graduation caps, use dense
engineering schematics, use gradients, make the homepage feel cold or
corporate — keep copy warm even though the layout is structured.
```

---

## Evaluation Matrix

See consolidated matrix in [`DIRECTION_C_EDITORIAL_BUILDER.md`](DIRECTION_C_EDITORIAL_BUILDER.md#evaluation-matrix--full-comparison).

| Criteria              | Modern Maker | Digital Workshop | Editorial Builder |
| --------------------- | -----------: | ---------------: | -----------------: |
| Beginner friendliness | 9 | 6 | 6 |
| Brand uniqueness | 6 | 8 | 7 |
| Build metaphor | 7 | 9 | 5 |
| Professional growth | 5 | 8 | 8 |
| Course discovery | 8 | 6 | 8 |
| Learning workspace | 7 | 8 | 6 |
| Showcase strength | 6 | 6 | 9 |
| Mobile adaptability | 8 | 6 | 7 |
| Long-term scalability | 5 | 8 | 7 |
