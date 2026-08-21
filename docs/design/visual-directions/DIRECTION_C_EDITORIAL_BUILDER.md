# Visual Direction C — Editorial Builder

## Name

Editorial Builder

## Concept

The most premium and restrained of the three directions. DirakitPro presented like a well-made product studio's portfolio site: large typography, generous whitespace, project output treated as the hero on every surface it appears, and blue used selectively rather than structurally. This direction bets hardest on "the output speaks for itself."

## Mood

Confident, calm, premium-but-accessible, editorial. Lightest visual density of the three directions — fewer visible grid lines and card borders than Digital Workshop, less modular tiling than Modern Maker.

## Brand Interpretation

The "dirakit" metaphor is present mostly through **pacing and reveal**, not literal shape language: content is presented in a clear progressive sequence (outcome → process → detail), mirroring "assembled piece by piece," but the visual system itself stays clean and typographic rather than block/tile-heavy. Where a build/assembly visual is needed (e.g. Build Progress), it is rendered as a minimal, refined line-based indicator rather than a busy graphic.

## Color Usage

Blue is the most selectively used of the three directions — large areas of the page are neutral-0/50 with black-adjacent neutral-900 typography, and brand-500/900 appear only at specific decision points: the primary CTA, the active progress indicator, and pull-quotes/callouts. Brand-50 is used as a rare, deliberate highlight (e.g. behind a single key stat or quote) rather than a general section background. This restraint is what makes the direction feel premium — blue reads as *considered* because it isn't everywhere.

## Typography Intent

Plus Jakarta Sans pushed to its largest, most confident sizes for headlines (Display XL and H1 get more room than the system default — larger size, tighter tracking), with body copy staying at standard system sizing for readability. The type-size contrast between headline and body is the largest of the three directions, which is what creates the "editorial" read.

## Layout Characteristics

Wide whitespace margins, asymmetric hero layouts (large image on one side, restrained text on the other), and content presented in long-form editorial blocks rather than dense grids of equal-sized cards. Where cards are used, they are fewer and larger rather than many small tiles.

## Card Style

`radius-md`, minimal or no visible border on primary showcase cards — separation comes from whitespace, not lines. Where a border is used (secondary cards, list items) it is a single hairline neutral-200, never paired with a heavy shadow.

## Progress Visualization

A minimal variant that borrows the *reading* of Candidate 1 (Vertical Assembly Timeline) but strips it down further: a thin single line with small labeled ticks, mostly typographic (step name + status word) with the visual line as a secondary reinforcement rather than the main event. This keeps Build Progress consistent with the direction's overall "typography leads, graphics support" character.

## Homepage Treatment

Hero is dominated by one large, real project screenshot with a short, confident headline beside or beneath it — minimal chrome, no busy background pattern. Featured projects/courses are presented as a small number of large editorial blocks (title + outcome statement + big screenshot) rather than a dense card grid, reinforcing that the output itself is the marketing asset.

## Course Detail Treatment

The "what you'll build" preview is presented at near-full-bleed size before any curriculum detail — the outcome is the opening statement of the page. Curriculum follows as a clean, restrained list further down, deliberately less visually loud than in Digital Workshop.

## Learning Workspace Treatment

Content pane gets maximal width and minimal chrome; navigation is reduced to the smallest footprint of the three directions (a slim collapsible rail rather than a persistent heavy sidebar), keeping focus entirely on the lesson/build content itself.

## Advantages

Strongest showcase/portfolio presentation of the three — best fit for `/projects` and public project pages, where "this looks worth sharing" matters most. Most premium first impression for the homepage. Ages well visually (least likely of the three to look dated in 2 years).

## Risks

**Risk: becoming too minimal or lacking learning energy — feeling like a static portfolio site rather than an active learning product.**

**How this direction avoids that:**
- Build Progress and completion moments (DESIGN.md §18) still get a real, visible treatment — the minimalism is about density and ornament, not about removing progress feedback. The learner never loses the "where am I" signal just because the visual system is quieter.
- Brand vocabulary at CTA/progress/completion moments (DESIGN.md §21) is used at full strength in this direction specifically *because* the visual system is calm — the copy carries more of the encouragement/energy load here than in Modern Maker, where visuals do more of that work.
- The homepage and dashboard retain clear, singular CTAs ("Mulai Merakit" / "Lanjut Merakit") rendered at strong visual weight even within the restrained system, so "premium" never reads as "passive" or "unclear what to do next."
- Course discovery still surfaces difficulty/duration/price clearly (not sacrificed for aesthetics) — editorial restraint applies to ornament, not to information the learner needs to decide.

## When It Works Best

`/projects` gallery, public project showcase pages, the homepage's first impression, and any moment meant to make a learner's finished work look genuinely worth sharing externally (e.g. on LinkedIn).

---

## Stitch Exploration Prompt

```text
Generate a mini visual concept for "DirakitPro," an outcome-first learning
platform for beginners in Indonesia. Direction: "Editorial Builder" —
large typography, generous whitespace, project output as hero, premium
but accessible, blue used selectively.

Produce exactly these four elements in one cohesive concept board:
1. Homepage hero: one large real-project-screenshot-style visual
   dominating the layout, a short confident headline in Indonesian beside
   or beneath it, minimal chrome, one clear CTA button
2. A course card: large build-outcome preview image, restrained title,
   difficulty + duration + price shown simply with minimal border/shadow
3. A Build Progress component as a thin minimal line with labeled ticks
   (step name + status word), clearly showing Completed / Current /
   Upcoming / Optional through label + shape, not color alone
4. A dashboard preview with a slim collapsible navigation rail and a
   wide content area showing 2-3 enrolled courses with the minimal
   progress line style

Color palette (mandatory): brand-50 #E3F2FD, brand-200 #90CAF9,
brand-500 #2196F3, brand-900 #0D47A1 used sparingly and deliberately —
most of the layout should be neutral-0/50 with near-black typography.
Blue appears only at the CTA, active progress state, and one deliberate
accent moment.

Typography: Plus Jakarta Sans, large confident headline sizing with
noticeably smaller/readable body text — strong size contrast is the
point. Radius: 10px, minimal borders, whitespace-driven separation
instead of cards-with-shadows everywhere.

Do not: use purple, use dense card grids, use heavy shadows, use
graduation caps or stock "student" photography, use construction/wrench
imagery, use gradients, make it feel like a static agency portfolio with
no sense of active progress/learning.
```

---

## Evaluation Matrix — Full Comparison

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
| **Total (of 90)** | **61** | **65** | **63** |

Scoring rationale, briefly:

- **Modern Maker** wins decisively on beginner friendliness, course discovery, and mobile adaptability — its weaknesses are brand uniqueness (closest to generic edtech patterns) and long-term scalability into professional tiers.
- **Digital Workshop** wins on build metaphor, professional growth, and learning workspace — the strongest signature identity and the best bridge to Understand/Engineer/Production/Scale — but scores lowest on beginner friendliness and course discovery, the exact surfaces a first-time visitor hits first.
- **Editorial Builder** wins decisively on showcase strength and ties for course discovery — the best fit for the product's "visible outcome" thesis on public-facing surfaces — but scores lowest on build metaphor, since its restraint works against a strong, distinctive progress visualization.

## Recommendation (Non-Binding)

No single direction wins outright, and the totals are close (61/65/63) by design — each direction optimizes for a different part of the funnel. The recommendation is **not** to pick one direction wholesale, but to note that the totals suggest a hybrid is worth testing in Session 2: **Modern Maker's approachability for the homepage/discovery surfaces**, **Digital Workshop's Build Progress and learning-workspace structure**, and **Editorial Builder's restraint for `/projects` and public showcase pages**. All three share the same DESIGN.md token system, so this kind of per-surface blending is mechanically straightforward rather than three incompatible visual languages.

> **Visual direction is not yet locked.** This recommendation is a starting hypothesis for Session 2's Stitch exploration, not a decision. The user should review the four-element concept boards from all three Stitch prompts above before any direction (or hybrid) is selected.
