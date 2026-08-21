# DirakitPro Design System

## 1. Design Status

```text
DRAFT — VISUAL DIRECTION NOT YET LOCKED
```

This document defines the shared design foundation (color, type, layout, spacing, components, tone) that all three candidate visual directions build on top of. Direction selection happens in Design Session 2. Nothing in this document commits to a final homepage, dashboard, or workspace layout — it commits to the *system* those layouts will be built from, regardless of which direction wins.

Source of truth for product scope: [`DirakitPro_MVP_PRD_V1.0.md`](../../DirakitPro_MVP_PRD_V1.0.md) (LOCKED). This design system does not alter P0 product scope.

## 2. Product Context

DirakitPro is an outcome-first learning platform for beginners in Indonesia. The core experience is:

```text
Discover → Purchase → Learn → Build → Complete → Submit → Publish → Showcase
```

The product sells a visible outcome, not a syllabus. Design must foreground **Build Progress**, **Project Output**, **Progressive Achievement**, **Visible Result**, and **Beginner Confidence** — never Video Consumption, Traditional Classroom framing, or Certificate-first Learning.

DirakitPro must not visually resemble a generic Udemy clone, corporate LMS, school/university portal, crypto dashboard, hacker terminal, or children's education app.

## 3. Brand Philosophy

> **Profesional itu dirakit.**
> **Mulai dari rakitan pertama.**

Professional quality is not instant — it is assembled progressively, piece by piece, and proven through real output. The design should read as **Digital Maker + Modern Product Studio + Learning Workspace**. The assembly metaphor (pieces, modules, layers, connections, structure, blueprint, completion, growth) should be present but subtle — never literal wrench/helmet/gear/factory/circuit-board imagery.

## 4. Design Principles

**Outcome before curriculum** — show what the learner will build before showing the syllabus. Course cards and hero sections lead with the output, not the topic list.

**Progress should feel visible** — a learner should always be able to answer "where am I, and what is being assembled" within one glance at the workspace.

**Beginner without looking childish** — approachable is achieved through clarity, warmth in copy, and generous whitespace, never through cartoon mascots, bright primary-color blocks, or playful bounce animation.

**Real work is the hero** — project screenshots carry more visual weight than instructor photography or stock imagery. If a screen has room for one large visual, it should usually be someone's actual output.

**One strong accent** — blue (`#2196F3` family) is the single dominant accent across the product. Semantic colors exist but never compete with it for attention. No rainbow UI, no gradient-per-section decoration.

**Calm learning workspace** — marketing surfaces may be expressive and image-heavy; `/learn/*` must be quieter, higher-contrast-for-content, and free of promotional visual noise.

**Grow with the user** — the same design language must still feel appropriate when DirakitPro introduces Understand → Engineer → Production → Scale tiers. Avoid a visual style so beginner-coded that it would embarrass a returning learner two tiers later.

## 5. Audience

Primary MVP audience: ages ~18–30, Indonesia, beginner or early-stage learner — university students, fresh graduates, career switchers, non-technical people exploring digital products, early junior developers, AI-assisted beginner builders.

Design target feeling:

> "Saya mungkin belum jago, tapi saya bisa mulai."

Explicitly not:

> "Platform ini hanya untuk programmer senior."

## 6. Visual Personality

Modern Maker + Digital Workshop + Editorial Product Design, evaluated as three distinct directions in [`visual-directions/`](visual-directions/) before any single direction is locked. All three share this system's color, type, spacing, and component rules — they differ in layout density, illustration use, and emotional register.

## 7. Color System

Four brand colors are mandatory and fixed by product decision:

```text
brand-50   #E3F2FD
brand-200  #90CAF9
brand-500  #2196F3
brand-900  #0D47A1
```

### 7.1 Full brand scale

Intermediate stops are derived along the same hue/chroma progression so the scale is continuous and harmonious (values below match the standard Material Blue ramp these four anchors are drawn from):

| Token | Hex | Typical use |
|---|---|---|
| brand-50 | `#E3F2FD` | Soft section backgrounds, info panels, build-progress zones |
| brand-100 | `#BBDEFB` | Subtle fills, chip backgrounds, hover backgrounds on light surfaces |
| brand-200 | `#90CAF9` | Secondary accents, illustration line work, lightweight progress fills |
| brand-300 | `#64B5F6` | Decorative accents, chart secondary series |
| brand-400 | `#42A5F5` | Hover state for brand-500 elements on dark surfaces |
| brand-500 | `#2196F3` | Primary interactive accent — links, active nav, progress bar fill, chart primary series |
| brand-600 | `#1E88E5` | Hover/pressed state for brand-500 controls |
| brand-700 | `#1976D2` | **Accessible default for primary buttons carrying white text at normal size** (see §20) |
| brand-800 | `#1565C0` | Pressed state for brand-700 buttons; strong section backgrounds |
| brand-900 | `#0D47A1` | High-emphasis headings, dark branded sections, selected/active state, premium emphasis |

### 7.2 Neutral palette

Cool-leaning neutrals (slight blue undertone) so blue accents never sit on a clashing warm gray:

| Token | Hex | Typical use |
|---|---|---|
| neutral-0 | `#FFFFFF` | Base surface, cards on light theme |
| neutral-50 | `#F6F8FB` | App background, section alternation |
| neutral-100 | `#EDF1F6` | Card background on neutral-50, table stripe |
| neutral-200 | `#DEE5ED` | Default border, divider |
| neutral-300 | `#C5CEDA` | Disabled border, input border (resting) |
| neutral-400 | `#A6B1C0` | Placeholder text, disabled icon |
| neutral-500 | `#7E8AA0` | Secondary/muted text on light surfaces |
| neutral-600 | `#5F6B80` | Body text (secondary emphasis) |
| neutral-700 | `#454F62` | Body text (default) on light surfaces |
| neutral-800 | `#2E3542` | Headings on light surfaces |
| neutral-900 | `#1B2029` | Primary text, near-black headings |
| neutral-950 | `#0F1218` | Dark-mode/dark-section base surface |

**Explicit rule:** the UI must never become "blue background + blue card + blue button + blue text." Neutrals carry the majority of every screen's surface area; brand blue is reserved for the specific uses in §7.3.

### 7.3 Semantic colors

Restrained, and never allowed to visually outcompete brand blue:

| Role | Base | Background tint | Notes |
|---|---|---|---|
| Success | `#2E9E5B` | `#E6F6EC` | Muted green — build milestone completed, payment success |
| Warning | `#C8790A` | `#FDF1DF` | Warm amber — campaign ending soon, optional step skipped |
| Danger | `#D14343` | `#FBEAEA` | Restrained red — payment failed, validation error, destructive action |
| Info | brand-500 `#2196F3` | brand-50 `#E3F2FD` | Reuses brand blue — informational callouts stay on-brand rather than introducing a fifth hue |

### 7.4 Usage hierarchy (as mandated)

- **`#0D47A1` (brand-900):** primary dark brand text, high-emphasis headings, strong branded sections, selected/active states, dark blue background sections, premium emphasis. Not for body text at length.
- **`#2196F3` (brand-500):** primary interactive accent — primary buttons (large/bold usage only, see §20), important links, progress indicator fill, selected elements, key data visualization, active navigation. Never used to paint entire page backgrounds.
- **`#90CAF9` (brand-200):** secondary accents, lightweight illustration, hover states, selected-card background accents, subtle diagrams, progress components, builder visual language.
- **`#E3F2FD` (brand-50):** soft section backgrounds, highlights, information panels, beginner-friendly visual zones, subtle cards, build-progress zones.

## 8. Typography

```text
Primary Sans:  Plus Jakarta Sans
Monospace:     JetBrains Mono
```

Plus Jakarta Sans is chosen over Inter/Geist for one reason: it reads slightly warmer and more "crafted" at display sizes while remaining fully neutral and highly legible at body sizes in both Bahasa Indonesia and English — a good match for "approachable but not corporate." It is open-source, has excellent Latin diacritic and numeral support, and performs well on both desktop and mobile. No separate display face is introduced — Plus Jakarta Sans at heavier weights (600–700) covers display needs, keeping the system to one sans family as required. JetBrains Mono covers code blocks, URLs, and technical labels (e.g. price/order IDs) with high-legibility tabular numerals.

| Style | Size / Line-height | Weight | Usage |
|---|---|---|---|
| Display XL | 56 / 64 | 700 | Marketing hero headline only |
| H1 | 40 / 48 | 700 | Page-level heading |
| H2 | 32 / 40 | 600 | Section heading |
| H3 | 24 / 32 | 600 | Card/subsection heading |
| Body Large | 18 / 28 | 400 | Lead paragraph, course outcome statement |
| Body | 16 / 26 | 400 | Default reading text, lesson content |
| Body Small | 14 / 22 | 400 | Secondary text, metadata, form helper text |
| Label | 14 / 20 | 600 | Buttons, nav items, form labels |
| Caption | 12 / 16 | 500 | Timestamps, tags, fine print |
| Code | 14 / 22 | 400 (mono) | Inline code, URLs, order/ID values |

Numerals must render as tabular figures wherever prices, progress percentages, or countdowns are shown, so digits don't shift width as they update.

## 9. Layout

```text
Max content width (marketing):     1280px
Max content width (reading/legal): 720px
Learning workspace width:          full-bleed, content column max 840px
Admin width:                       1440px (data-dense, benefits from more room)
```

| Breakpoint | Grid | Notes |
|---|---|---|
| Desktop (≥1024px) | 12-column, 24px gutter | Marketing 12-col; workspace splits into sidebar (fixed ~280px) + content (fluid) |
| Tablet (768–1023px) | 8-column, 20px gutter | Sidebar collapses to top tab bar or drawer on workspace |
| Mobile (<768px) | 4-column, 16px gutter | Single column everywhere; curriculum becomes a bottom sheet/drawer |

Section spacing on marketing pages should feel generous (see §10); the learning workspace uses tighter, denser spacing so more build content fits above the fold — calm does not mean sparse.

## 10. Spacing

Base scale (px), 4px atomic unit, used exclusively — no arbitrary values:

```text
4   8   12   16   24   32   48   64   80   96
```

| Token | Value | Semantic use |
|---|---|---|
| space-1 | 4px | Icon-to-label gap, tight inline spacing |
| space-2 | 8px | Form field internal padding, chip padding |
| space-3 | 12px | Compact card padding, list item spacing |
| space-4 | 16px | Default card padding, form field vertical gap |
| space-6 | 24px | Card-to-card gap, component internal sections |
| space-8 | 32px | Section internal spacing, dashboard widget gap |
| space-12 | 48px | Between major page sections (mobile) |
| space-16 | 64px | Between major page sections (desktop) |
| space-20 | 80px | Marketing hero vertical padding |
| space-24 | 96px | Large marketing section breaks |

## 11. Border Radius

```text
radius-sm    6px    inputs, chips, small buttons, badges
radius-md    10px   default cards, buttons, dropdowns
radius-lg    16px   large cards, modals, hero panels
radius-xl    24px   hero/art containers only (sparingly)
```

Buttons default to `radius-md` (10px) — never fully pill-shaped by default, to avoid a "toy" feel. A pill shape (`radius-full`) is reserved for tags/badges/status chips only (e.g. `ACTIVE`, `FEATURED`), where a pill communicates "status label" rather than "action."

## 12. Elevation

DirakitPro should feel structured and modern, not like a stack of floating dashboard cards. Prefer **border + subtle elevation** over heavy shadow:

| Level | Treatment | Use |
|---|---|---|
| Surface | `border: 1px solid neutral-200`, no shadow | Default cards, list rows |
| Raised | `border: 1px solid neutral-200` + shadow `0 1px 2px rgba(16,24,40,0.04)` | Hover state, active card |
| Overlay | shadow `0 4px 16px rgba(16,24,40,0.08)`, no border | Dropdowns, popovers, tooltips |
| Modal | shadow `0 12px 32px rgba(16,24,40,0.16)`, `radius-lg` | Dialogs, checkout confirmation, moderation actions |

## 13. Iconography

Lucide-style outline icons throughout (matches the committed frontend stack's icon set — see PRD §14.2). Consistent 1.5–2px stroke, no filled icons except for small status dots. Icons are functional, not decorative filler — never substituted for a text label where the meaning is ambiguous without one (e.g. "Publish" always has a label, not just an icon).

## 14. Imagery

Primary imagery is **actual project screenshots, product previews, and learner output** — not generic stock photography. This is the single most important imagery rule in the system: DirakitPro sells a visible outcome, so the product's own proof (what learners build) should be the default hero visual on the homepage, course cards, and showcase pages. Stock photography is acceptable only for placeholder states before real learner output exists, and must be swapped for real output as soon as it's available.

## 15. Illustration

Illustration vocabulary: modular blocks, screens, layers, progress connectors, small blueprint-style annotations — rendered in the brand blue scale (mostly brand-200/brand-300 line work on neutral-50/brand-50 fields). Explicitly avoid: wrench icons, construction helmets, gear-heavy machinery, factory imagery, dense circuit-board patterns, generic stock-illustration style, humans holding oversized laptops, graduation caps, cartoon classrooms.

## 16. Motion

Motion communicates **assembly, progress, completion, connection** — never decoration for its own sake.

Approved patterns: a block/module animating into place (150–250ms ease-out), a progress bar filling on milestone completion, a project preview assembling piece-by-piece on the showcase reveal, a subtle connector line drawing between two build steps, a restrained checkmark/scale-in on milestone completion.

Avoid: bouncing, spinning loaders beyond a simple minimal spinner, excessive parallax, any animation that loops indefinitely on a content-heavy screen. Motion must never delay a learner from reading lesson content or reaching the next action — respect `prefers-reduced-motion` and fall back to instant state changes.

## 17. Components

**Navigation** — three distinct headers: marketing header (logo, nav links, CTA, transparent-to-solid on scroll), learner header (logo, dashboard link, account menu, no marketing CTAs), admin navigation (persistent left sidebar, denser, data-first). They must not be visually interchangeable — a learner should never wonder if they're on a marketing page.

**Buttons** — Primary (brand-700 fill + white label, per accessible-contrast rule in §20), Secondary (neutral-0 fill, neutral-300 border, neutral-900 label), Tertiary (no fill/border, brand-700 label — used for lower-emphasis actions), Destructive (danger-500 fill, white label — reserved for irreversible actions like unpublish/revoke), Disabled (neutral-200 fill, neutral-400 label, no pointer), Loading (same size as resting state with an inline spinner replacing the label icon — button never resizes on loading).

**Course Card** — leads with a build-outcome visual (final-result preview image), then title, then a compact row of difficulty + duration + price. Does not lead with an instructor photo/name; instructor credit, if shown, is secondary metadata below the fold of the card.

**Bundle Card** — must surface, in this order of visual priority: bundle type badge (`FIXED`/`CHOOSE_N`), bundle price vs. informational retail-total context, selection rule if `CHOOSE_N` (e.g. "Pilih 2 dari 4 course"), campaign expiry/countdown, and a clear value framing. Bundle cards use brand-900/brand-700 more heavily than course cards to visually signal "campaign," not "everyday catalog item."

**Project Card** — screenshot first (largest visual element on the card), then project name, then learner display name, then status (visibility/moderation as a small badge), then a short technology tag row. Screenshot occupies materially more area than any other element.

**Build Progress** — signature component, see §18.

**Lesson Navigation** — a structured list grouped by Stage, each item showing lesson type icon (Concept/Demo/Build/Checkpoint/Deploy), title, and a completion indicator. Current lesson always visually distinct (not just color — also an indicator glyph, for accessibility).

**Learning Workspace** — content pane is the largest visual area; task/checkpoint block sits directly under or beside content (not buried in a separate tab); a persistent "next action" affordance is always visible without scrolling.

**Forms** — labels always visible (no placeholder-as-label), inline validation on blur, error text directly under the field it belongs to, generous touch targets (see §20 for minimums).

**Empty States** — encouraging, specific, and in-voice. Always paired with a next action. Example: "Belum ada rakitan di sini. Mulai course pertamamu untuk mulai merakit." with a CTA button — never a bare "No data available."

## 18. Signature Components

### 18.1 Build Progress

The product's signature motif. Must visually distinguish four states — **Completed**, **Current**, **Upcoming**, **Optional** — through shape/icon, not color alone (color-blind and low-vision safe).

Two candidate representations to prototype in Stitch (Session 2 decides between them, or a hybrid):

**Candidate 1 — Vertical Assembly Timeline.** A vertical connected-line list, each build step as a "block" node on the line: filled brand-500 circle + checkmark for Completed, brand-500 ring (unfilled) with a pulsing dot for Current, neutral-300 outline circle for Upcoming, a dashed neutral-300 circle for Optional. Connector line between nodes fills solid brand-500 up to the current step, and stays neutral-200 ahead of it — reading as a cable/circuit being completed rather than a checklist. A percentage + fraction label ("68% • 4 dari 6 tahap") sits at the top, and a compact horizontal bar mirrors the same fill for quick scanning.

**Candidate 2 — Modular Completion Grid.** Each build step is a small rectangular "block" tile (matching the card radius-sm language) arranged in a horizontal or wrapped grid, sized roughly proportional to relative effort. Completed tiles are solid brand-500/brand-700 with a checkmark, Current tile has a brand-200 fill with an animated subtle border pulse, Upcoming tiles are outlined neutral-300, Optional tiles have a dashed border and a small "opsional" tag. This reads more literally as "pieces of the build," and scales well to a dashboard summary card (many courses at once) since it compresses to a small multi-tile strip.

Recommendation to prototype first: **Candidate 1** for the in-course workspace (it reads as a journey, which matches the linear stage/lesson structure), and a compressed version of **Candidate 2** for the dashboard's multi-course overview (it reads well at small size). Final choice deferred to Session 2 visual testing.

### 18.2 Project Result

The completion moment must feel like a professional deliverable being unveiled, not a gamified reward screen. Layout: large project screenshot as the dominant element (full-width or near-full-width), project title directly below in H2/H3 weight, a live-URL chip (clickable, monospace), a short feature list, a technology tag row, and share controls (copy link, LinkedIn/generic share) as a clearly secondary row beneath — never overlaid on the screenshot. A single restrained celebratory moment is acceptable at the instant of reaching this state (e.g. a brief checkmark/scale-in transition, or a one-line "Rakitanmu jadi." heading) — no confetti, no full-screen modal takeover, no sound.

## 19. Responsive Rules

**Desktop** — richer split layouts are allowed (e.g. curriculum sidebar + content pane side-by-side in the workspace), but nothing shown only works at desktop width; every P0 flow must complete on mobile.

**Tablet** — sidebar navigation typically collapses into a top tab bar or a toggleable drawer; grids reduce from 3–4 columns to 2.

**Mobile** — single column throughout. Learning Workspace specifically uses: a top progress bar (compressed Build Progress), the lesson content below it, and curriculum navigation moved into a bottom sheet/drawer triggered by a persistent small "Curriculum" affordance — never a full desktop sidebar squeezed into mobile width.

## 20. Accessibility

**Color contrast** — body text (neutral-700/900) on light surfaces (neutral-0/50) exceeds 7:1. Text on brand-500 (`#2196F3`) with white foreground measures ≈3.1:1 — this **passes WCAG AA only for large-scale text** (≥24px regular or ≥18.7px bold), not normal body/button text. For normal-size white-on-blue text (standard buttons, nav labels), use **brand-700 (`#1976D2`)**, which measures ≈4.6:1 and clears AA for normal text. brand-500 remains appropriate for large CTA headlines, icons, progress fills, and other non-text or large-text uses, where WCAG's 3:1 non-text/large-text threshold applies.

**Interactive states:**
- Hover: shift one step toward brand-700/800 (buttons) or neutral-100 (secondary surfaces).
- Focus ring: 2px solid brand-700, 2px offset, visible on every focusable element including custom controls — never removed via `outline: none` without a replacement.
- Disabled: neutral-200 fill / neutral-400 label (contrast intentionally reduced per WCAG's disabled-content exemption; disabled controls are also never the only path to an action).
- Error: danger-500 border + text, danger-50 background fill, paired with an inline icon plus text (not color alone).

**Other baseline requirements:** semantic HTML landmarks and heading order on every page; full keyboard operability for all P0 flows including checkout and the learning workspace; visible focus order matching visual order; form fields always have a programmatically associated `<label>`; minimum touch target 44×44px on mobile controls; motion respects `prefers-reduced-motion`; images (course, project, illustration) carry meaningful `alt` text, decorative illustrations use empty `alt=""`; screen-reader users get equivalent progress information via text (e.g. "4 of 6 langkah selesai"), not a bar graphic alone.

## 21. Content Language

Voice: clear, encouraging, practical, confident, non-patronizing — a supportive professional mentor, not a hype cheerleader.

Brand vocabulary (`Mulai Merakit`, `Lanjut Merakit`, `Sedang Kamu Rakit`, `Progress Rakitan`, `Rakitan Pertama`, `Hasil Rakitan`, `Tunjukkan Karyamu`, `Rakitanmu Sudah Jadi`) is used at CTA, progress, completion, and showcase moments — exactly where it adds identity without harming clarity. Conventional terms (`Checkout`, `Order`, `Account`, `Payment`) stay conventional; do not rebrand them.

Preferred pattern — specific and factual, not generic praise:

```text
Good:  "Rakitan pertama selesai."
Good:  "Berikutnya, sambungkan data ke database."
Good:  "Kamu sudah menyelesaikan 4 dari 6 tahap."
Avoid: "Wow kamu hebat sekali!" (as a stock reaction to every action)
```

Empty states follow the same rule (see §17): specific, in-voice, always paired with a next action.

## 22. Design Do / Don't

**Do:** lead every course/project surface with real output. Use neutrals as the majority surface color. Reserve brand-900 for emphasis moments. Keep the learning workspace visually calmer than marketing pages. Use brand vocabulary at emotional high points (CTA, completion, showcase). Show progress as both a visual and a text equivalent.

**Don't:** default every button/card/background to blue. Use literal industrial/construction iconography. Use graduation caps, cartoon classrooms, or generic "student holding laptop" stock photography. Introduce a second dominant brand hue. Let motion loop indefinitely on content screens. Ship a progress indicator with no text/numeric equivalent. Rebrand conventional commerce/account terminology for the sake of "voice."

## 23. Stitch Usage Rules

Full operational detail lives in [`STITCH_MASTER_PROMPT.md`](STITCH_MASTER_PROMPT.md). In summary: every Stitch generation is scoped to one screen at a time, always prefixed with the reusable Master Product Context, and iterated via generate → screenshot → review → remediation prompt → regenerate → lock. Never request multiple unrelated screens in one generation, and never let Stitch improvise product behavior that isn't in the PRD or this design system.

Visual exploration may use Google Stitch, Claude Design, or another design tool, but generated outputs must conform to this DESIGN.md and the LOCKED PRD — this document is the visual source of truth, and any design tool is a rendering/exploration surface downstream of it, not a source of product or design truth itself.

## 24. Implementation Notes

This document, the three visual direction documents, the screen inventory, and the Stitch master prompt are **specification artifacts**. They intentionally define tokens (color hex values, spacing scale, radius scale, type scale) in a framework-neutral way so that, when implementation begins, they translate directly into a Tailwind theme/config and shadcn/ui component tokens without redesign — but that translation is out of scope for this session. No `tailwind.config`, CSS, or component code is produced here.
