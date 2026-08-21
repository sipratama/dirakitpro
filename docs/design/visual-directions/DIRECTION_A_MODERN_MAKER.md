# Visual Direction A — Modern Maker

## Name

Modern Maker

## Concept

The friendliest of the three directions. DirakitPro presented as an inviting workshop for first-timers: modular card shapes, clear blue accents, and visible progress everywhere, without ever tipping into "kids' coding app." The product feels optimistic about the learner's first attempt.

## Mood

Optimistic, light, approachable, energetic-but-composed. Lighter visual weight than the other two directions — more white space per element than Digital Workshop, but more structure and modularity than Editorial Builder.

## Brand Interpretation

The "dirakit" (assembled) metaphor shows up as **modular building blocks**: rounded rectangular tiles that visibly connect into a whole — a course card looks like one "piece," a Build Progress step looks like another piece snapping into a growing row. The metaphor stays at the level of shape language and connector lines, never literal tools or machinery.

## Color Usage

Brand-50/100 used generously as section and card-accent backgrounds — this is the direction that leans most on the light end of the brand scale, reinforcing "beginner-friendly." Brand-500 carries primary buttons, active nav, and progress fills at large/bold sizes; brand-700 is used wherever button text is normal-sized (per the accessible-contrast rule in DESIGN.md §20). Brand-900 appears sparingly — mainly in the header logo treatment and completion moments — so the direction doesn't read as heavy or corporate. Semantic colors (success green especially) get slightly more visual presence here than in the other directions, since milestone/checkpoint celebration is a core part of this direction's optimism.

## Typography Intent

Plus Jakarta Sans at rounder-feeling weights (600 for headings rather than 700 where possible) to keep the type warm. Slightly larger body size (17px effective) and looser line-height than the system default, since this direction is the most beginner-oriented and benefits from a touch of extra breathing room.

## Layout Characteristics

Modular card grids dominate — homepage, course catalog, and dashboard all use a consistent tile-grid rhythm. Sections are visually chunked into distinct rounded containers rather than flowing as continuous text blocks. Generous gaps between modules (space-6/space-8) reinforce "assembled from separate pieces."

## Card Style

`radius-md`–`radius-lg`, visible border + light brand-50 accent fill on hover (not just a shadow), small connector/notch details on Build Progress cards to reinforce the modular-block metaphor. Course cards have a slightly larger corner radius than the system default to feel more approachable.

## Progress Visualization

Leans into **Candidate 2 — Modular Completion Grid** from DESIGN.md §18.1: each build step as a small tile, filling in as it's completed. This direction is the natural home for that representation because the tile/grid language matches its overall card-based visual system.

## Homepage Treatment

Hero leads with a real project screenshot inside a friendly rounded frame, headline in H1/Display weight, brand-50 background wash behind the hero. Featured courses and student projects both use the tile-grid card system. CTA buttons are prominent and singular per section (no competing CTAs).

## Course Detail Treatment

"What you'll build" preview is the first thing under the hero — shown as a card, not just a paragraph. Curriculum is presented as a chunked, modular list (matching Stage → Lesson hierarchy visually as a set of connected tiles) rather than a dense accordion.

## Learning Workspace Treatment

Even here, the modular card language persists but is dialed down — content pane is the calm, focused center; Build Progress sits as a compact tile-grid strip at the top rather than a full sidebar, keeping the workspace feeling lighter than Digital Workshop's version.

## Advantages

Fastest to feel "friendly and low-pressure" for a true beginner. Strong fit for the homepage, onboarding, and the completion/celebration moment. Highly legible modular grid translates cleanly to mobile (tiles stack naturally).

## Risks

**Risk: becoming too playful or generic edtech.** Rounded tiles + light blue + friendly type is also the visual signature of a lot of interchangeable consumer-education products.

**How this direction avoids that:**
- Radius stays capped at `radius-lg` (16px) — never fully rounded "bubble" cards, and buttons stay at `radius-md`, not pill-shaped.
- No mascot, no cartoon iconography, no bouncy easing — motion follows DESIGN.md §16 exactly (assembly/progress only).
- Brand-900 and neutral-900 text are used deliberately in headings so the type still reads as confident and adult, not childlike, even against the lighter card backgrounds.
- Real project screenshots (not illustration) remain the dominant imagery — illustration is decorative support only, never the primary visual, which keeps the direction anchored to "real outcomes" rather than "cute app."

## When It Works Best

Homepage, course discovery, first-time onboarding, and the project-completion celebration moment — anywhere the goal is lowering intimidation and maximizing "I can start this."

---

## Stitch Exploration Prompt

```text
Generate a mini visual concept for "DirakitPro," an outcome-first learning
platform for beginners in Indonesia. Direction: "Modern Maker" — friendly,
optimistic, modular, approachable but not childish.

Produce exactly these four elements in one cohesive concept board:
1. Homepage hero (headline + subheadline in Indonesian, one CTA button,
   one large real-project-screenshot-style visual in a rounded frame)
2. A course card (build-outcome preview image first, title, difficulty +
   duration + price row — no instructor photo)
3. A Build Progress component showing 6 steps as small modular tiles,
   with clear Completed / Current / Upcoming / Optional states
   distinguished by both shape and color
4. A dashboard preview showing 2-3 enrolled courses with compact progress
   tiles and a "Lanjut Merakit" CTA

Color palette (mandatory): brand-50 #E3F2FD, brand-200 #90CAF9,
brand-500 #2196F3, brand-900 #0D47A1, plus cool neutrals (white to
near-black) as the majority surface color. Do not paint backgrounds,
cards, and buttons all in blue — neutrals should dominate, blue accents
the interactive/progress elements.

Typography: Plus Jakarta Sans, rounded/warm weight, generous line-height.
Radius: 10-16px on cards and buttons, never pill-shaped, never sharp/0px.
Elevation: subtle border + light shadow, not heavy floating-card shadows.

Do not: use purple, use graduation caps, use construction/wrench imagery,
use cartoon mascots, use stock photography of people holding laptops,
generate a generic SaaS dashboard look, use gradients.
```

---

## Evaluation Matrix

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

See the full comparison and recommendation in [`DIRECTION_C_EDITORIAL_BUILDER.md`](DIRECTION_C_EDITORIAL_BUILDER.md#evaluation-matrix--full-comparison), which carries the consolidated matrix and written recommendation to avoid triplicating the same discussion across all three files.
