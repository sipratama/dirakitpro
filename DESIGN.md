# DirakitPro — Design System

| Field | Value |
|---|---|
| Status | **v1 — draft** (rebuilt from scratch; supersedes any prior DESIGN.md) |
| Last updated | 23 August 2026 |
| References | `DirakitPro_MVP_PRD_V1.0.md` (internal version V1.1) — brand philosophy (4.2–4.6), product ladder (19.1) |
| Scope | Foundation tokens + core component rules. Screen-level layout lives in `SCREEN_INVENTORY.md` and `screens/HOMEPAGE.md` (not yet rebuilt). |

> **Why this document exists.** The previous `docs/design/` folder (DESIGN.md, SCREEN_INVENTORY.md, three visual-direction candidates, HOMEPAGE.md) was deleted from the working tree without being committed. Rather than reconstruct blind, this version was rebuilt from an explicit design conversation — decisions below are traceable to that conversation, not guessed.

## 1. Brand foundation

**Philosophy:** *Profesional itu dirakit* (PRD 4.3). **Mood:** playful & approachable — built for beginners who are intimidated by coding, not for engineers who already feel confident.

Every color and type decision below maps to the **PRO framework** already defined in the PRD (4.2), so the system reinforces the brand instead of just decorating it:

| PRO pillar | Meaning | Visual encoding |
|---|---|---|
| **P**roven | Evidence of real output — the spark when something becomes real | Amber (primary/action color) |
| **P**rofessional | Grounded, credible | Ink (text/structure color) |
| **P**rogress | Forward motion, milestones | Teal (progress/success color) |

## 2. Color system

### 2.1 Core brand tokens

| Token | Hex | Role |
|---|---|---|
| `brand-amber` | `#F5A623` | Primary — CTAs, active states, "Proven" |
| `brand-amber-tint` | `#FCE9C7` | Amber badge/highlight backgrounds |
| `brand-amber-text` | `#7A4B00` | Text on `brand-amber-tint` |
| `brand-ink` | `#2B2620` | Primary text, headings, "Professional" |
| `brand-teal` | `#2F9E6E` | Progress bars, success states, "Progress" |
| `brand-teal-tint` | `#E4F5EC` | Success banner background |
| `brand-teal-text` | `#1F6B4A` | Text on `brand-teal-tint` |
| `brand-cream` | `#FDF7EF` | Page background — deliberately not stark white |

**Rule:** amber is the *only* saturated color allowed on a primary CTA button. If a screen has more than one amber button competing for attention, that's a signal the screen is doing too much — split it, don't recolor it.

### 2.2 Warm neutral scale

Standard grays read cold against a cream background, so the neutral scale is warm-tinted instead:

| Token | Hex | Use |
|---|---|---|
| `neutral-50` | `#FDF7EF` | Alias of `brand-cream` — page bg |
| `neutral-100` | `#E8DFD0` | Card borders, dividers |
| `neutral-300` | `#B3A890` | Disabled text, placeholder icons |
| `neutral-600` | `#7A6F5E` | Secondary/supporting text |
| `neutral-900` | `#2B2620` | Alias of `brand-ink` — primary text |
| `surface` | `#FFFFFF` | Card/panel surfaces (sits on top of cream page bg) |

### 2.3 Tier ladder — Product Ladder (19.1) color-coding

Confirmed this session: the blue scale you proposed maps 1:1 onto the four post-Build tiers. This is **not** a competing primary color — it only appears on tier badges/previews for content that doesn't exist yet in MVP scope.

| Tier | Hex | PRD 19.1 label |
|---|---|---|
| Build | `brand-amber` `#F5A623` | Rakitan Pertama — **the only active tier in MVP** |
| Understand | `#E3F2FD` (bg) / `#0D47A1` (text) | Rakitan Dipahami |
| Engineer | `#90CAF9` (bg) / `#0D3D73` (text) | Rakitan Terstruktur |
| Production | `#2196F3` (bg) / `#FFFFFF` (text) | Rakitan Production |
| Scale | `#0D47A1` (bg) / `#FFFFFF` (text) | Rakitan Profesional |

Until Understand/Engineer/Production/Scale courses actually exist (post-MVP), these tokens are only used for a "roadmap preview" strip — never as an interactive/purchasable element. Don't build the tier badge component into course cards until there's a second tier to show; one active tier doesn't need a selector.

### 2.4 Semantic states

| State | Background | Text | Notes |
|---|---|---|---|
| Success | `brand-teal-tint` `#E4F5EC` | `brand-teal-text` `#1F6B4A` | Reuses Progress color — success *is* progress in this product |
| Danger | `#FBEAE7` | `#7A241A` (fill `#D6483C`) | Payment failure, form errors |
| Warning | `#FBF0DC` | `#6B4A15` (fill `#C68A2E`) | Deliberately *not* amber — a warning in the brand's own primary color would read as a promo, not a caution |
| Info | Understand-tier tokens `#E3F2FD` / `#0D47A1` | — | Reuses tier-ladder blue; no separate info color needed |

### 2.5 Dark mode — explicitly deferred

Not speced for MVP. The PRD's own Non-Functional Requirements (15) don't list dark mode, and building a full parallel token set now is exactly the kind of premature work the PRD's own "MVP simplicity" principle (4.6) warns against. Tokens above are named by role (not raw hex) specifically so a dark palette can be layered in later without renaming anything that already shipped — but do not build it speculatively.

### 2.6 Accessibility check

All text/background pairs above target WCAG AA. One pair needs a caution: white text on `#2196F3` (Production tier) sits close to the 3:1 UI-component threshold — fine for a badge label, but don't drop it onto small (<14px) body text. Verify with a contrast checker before reusing that pair anywhere outside the tier badge.

## 3. Typography

**Single family, three weights** — Plus Jakarta Sans (400/500/700), used for everything: headings, body, and UI chrome. One font is a deliberate restraint call for a solo builder: no font-pairing decisions to maintain, no FOUT mismatch between a heading font and a body font loading at different times.

Implementation: `next/font/google` with `Plus_Jakarta_Sans`, matching the Next.js stack (PRD 14.2).

| Token | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| `text-display` | 40px | 700 | 1.2 | Marketing hero headline only |
| `text-h1` | 32px | 700 | 1.25 | Page titles |
| `text-h2` | 24px | 700 | 1.3 | Section headers |
| `text-h3` | 19px | 700 | 1.3 | Card titles, subsection headers |
| `text-body-lg` | 17px | 400 | 1.6 | Lesson/reading content |
| `text-body` | 15px | 400 | 1.6 | Default UI text |
| `text-small` | 13px | 400 | 1.5 | Captions, metadata, timestamps |
| `text-micro` | 11px | 500 | 1.4 | Badge/tag labels |

**Voice rule:** sentence case everywhere (no Title Case, no ALL CAPS) — matches the brand's conversational tone ("Mulai dari rakitan pertama", not "MULAI DARI RAKITAN PERTAMA"). Product vocabulary (Mulai Merakit, Lanjut Merakit, etc.) is defined once in PRD 4.5 — don't redefine it here, just use it consistently in component copy.

## 4. Spacing, radius, elevation

- **Spacing:** standard Tailwind 4px-base scale (4/8/12/16/20/24/32/40/48/64px). No custom scale — no reason to diverge from the framework default.
- **Radius:** `12px` cards, `10px` buttons/inputs, `999px` (full) for badges/pills. Rounded-but-not-bubbly — enough softness to feel approachable, not so much it feels like a kids' app.
- **Elevation:** flat by default. Cards separate from the cream page background via a `1px solid neutral-100` border, not a shadow. Reserve shadow for genuinely floating elements (modals, dropdowns) — overusing shadow on flat cards is a common tell of an unrefined design system.

## 5. Core components

These extend shadcn/ui primitives (PRD 14.2) with DirakitPro tokens — this section defines *what changes from shadcn defaults*, not a full component rebuild.

### 5.1 Button
- **Primary:** `brand-amber` fill, `#3D2400` text, `10px` radius. One per view maximum — if a screen wants two primary actions, one of them is actually secondary.
- **Secondary:** transparent fill, `1px solid neutral-100` border, `brand-ink` text.
- **Ghost:** no border, `brand-ink` text, `neutral-50`-tint hover.
- Label copy: verb-first, sentence case, 1–3 words — "Lanjut merakit", not "Klik untuk melanjutkan proses pembelajaran".

### 5.2 Progress bar
- Track: `neutral-100`. Fill: `brand-teal`. Height `8px`, full radius.
- This is the single most-seen component in the product (Build Progress is the north-star UX per PRD 1) — it should never share a color with anything decorative on the same screen.

### 5.3 Badge / tag
- Category tag (e.g. "Rakitan pertama"): `brand-amber-tint` bg, `brand-amber-text` text.
- Tier badge: see 2.3.
- Status badge (order/moderation state): use semantic tokens (2.4), never brand tokens — a status badge that happens to be amber-colored could be misread as a CTA.

### 5.4 Card
- `surface` (`#FFFFFF`) background, `1px solid neutral-100` border, `12px` radius, `20px` padding.
- Course card anatomy: category tag → title (`text-h3`) → one-line outcome description (`text-body`, `neutral-600`) → progress bar (enrolled state only) → primary button.

### 5.5 Alert / banner
- Uses semantic tokens (2.4) only. Icon (Lucide, per PRD 14.2) + message, no dismiss-by-default for payment/enrollment-critical alerts.

## 6. Iconography

Lucide (already in stack, PRD 14.2). Outline style, 20px inline / 24px max decorative, inherits current text color — no separate icon color palette.

## 7. Open items — deliberately not decided here

- **Illustration/photography style** — no marketing imagery direction chosen yet. Needs its own pass once homepage IA exists.
- **Empty states, loading states** — copy and layout patterns not yet defined; belongs in `SCREEN_INVENTORY.md`.
- **Dark mode** — see 2.5, explicitly deferred.

## Next steps

This foundation is enough to start `HOMEPAGE.md` (layout/IA) and `SCREEN_INVENTORY.md` (full route-by-route screen list per PRD 12). Recommend homepage next, since it's the one screen every persona in 3.2 hits first and it's what actually exercises whether this token set holds up outside a color-swatch preview.
