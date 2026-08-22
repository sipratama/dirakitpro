# DirakitPro Homepage Product & UX Specification

## 1. Status

```text
Homepage Product / UX Specification: READY FOR VISUAL DESIGN
Homepage Information Architecture:   V1.1 — SIMPLIFIED (see Revision Note)
```

This is a specification, not a locked visual design. This document is source context for Homepage visual work in Google Stitch and/or Claude Design (see §19 Design Tool Roles).

**Revision note (this remediation):** the original Homepage V1 specification (Design Session 3A) baselined 13 always-rendered sections. After initial visual generation, several sections were found to repeat the same product message. This revision simplifies the baseline to **7 sections + 1 conditional section**, by merging redundant pairs and removing two sections from the homepage entirely:

- `What Can You Build?` + `Featured Courses` → merged into **Mau Merakit Apa?**
- `How DirakitPro Works` + `Signature Build Progress` → merged into **Belajar dengan Merakit**
- `Outcome Proof` + `Learner Project Showcase` → merged into **Dari Kosong Sampai Jadi**
- `Social Proof` → removed from baseline, documented in §10 as deferred, real-data-only content
- `Learning Progression` → removed from the homepage entirely; preserved as a brand framework in `DESIGN.md` (§4, "Grow with the user"), not deleted from the product

Any reference elsewhere in this document to "13 sections," a standalone "Featured Courses," "Learning Progression" on the homepage, or baseline "Social Proof" describes the **superseded** V1 structure and must not be read as current. The current authoritative IA is §7 below.

Authority chain for this document:

```text
DirakitPro_MVP_PRD_V1.0.md   (LOCKED — product source of truth)
        ↓
docs/design/DESIGN.md         (LOCKED visual direction — Hybrid Digital Workshop V1)
        ↓
docs/design/SCREEN_INVENTORY.md (route contract — Wave 1, "/" Homepage)
        ↓
docs/design/screens/HOMEPAGE.md (this document)
        ↓
Claude Design (composition reference) + Google Stitch (reusable assets) — see §19
        ↓
Implementation (not started)
```

## 2. Purpose

The homepage exists to move an interested beginner through a specific sequence, without presenting DirakitPro as a generic course marketplace:

```text
Understand
↓
Desire
↓
Trust
↓
Explore
↓
Start
```

This replaces the longer seven-question framing used in the original specification — the underlying intent (communicate what DirakitPro is, prove it's real, build enough trust to explore, and get to a start) is unchanged, but the homepage no longer tries to expose every DirakitPro concept on the first page. A shorter page is not a simpler page — retained sections are more visually substantial, not thinner.

It converts an interested visitor into either **Course Discovery** (browsing `/courses`, `/courses/[slug]`) or a **First Build Start** (entering checkout for a specific course or bundle).

## 3. User

Primary: Guest, per `SCREEN_INVENTORY.md`'s Wave 1 entry for `/`. Ages ~18–30, Indonesia, beginner or early-stage learner (PRD §3.2, DESIGN.md §5). Secondary: a returning Learner may land here via a shared link, but `/dashboard` remains their real home — unchanged from the prior revision.

Target feeling on exit: *"Saya mungkin belum jago, tapi saya bisa mulai."* Never: *"Platform ini hanya untuk programmer senior."*

## 4. Product Goals

- Communicate the outcome-first positioning within roughly one viewport.
- Prove, not just claim, that learners build real, visible things — now concentrated into one strong output section (§9.4) rather than spread across two.
- Differentiate DirakitPro from a generic video-course catalog without using "LMS" as positioning (PRD §4.1).
- Present Build Progress as a distinctive, memorable mechanic, fused with the "how it works" explanation rather than shown twice.
- Surface an active bundle campaign when one exists, without ever implying one always exists.

## 5. Conversion Goals

Unchanged from the prior revision: primary conversion is **Course Discovery** or **First Build Start**, secondary is a visit to `/projects`. The homepage performs no checkout logic itself — it only routes to the existing screens already defined in `SCREEN_INVENTORY.md`.

## 6. Visual Direction

Per `DESIGN.md` §25 (Hybrid Digital Workshop V1), the homepage sits closer to the Modern Maker end of the hybrid than the learning workspace does, with each retained section carrying a specific allocation (§9, §17 Direction Allocation table). Fewer sections means each one now needs to hold its visual-direction identity for longer — this is intentional; giving sections more room is the same design decision as reducing their count (see §16 Homepage Visual Rhythm below).

## 7. Information Architecture (current, authoritative)

```text
Baseline sections:     7
Conditional sections:  1 (Campaign / Bundle Spotlight)

Normal homepage:            7 sections
Homepage with active campaign: 8 sections
```

```text
01 Hero
02 Mau Merakit Apa?
03 Belajar dengan Merakit
04 Dari Kosong Sampai Jadi
05 Kenapa DirakitPro?
   [ Campaign / Bundle Spotlight — CONDITIONAL, renders here only if ACTIVE ]
06 FAQ
07 Final CTA
```

This document does not describe the homepage as an 8-section baseline — 8 is the count only on days a campaign happens to be active; the baseline is 7.

## 8. Navigation

Unchanged from the prior revision — still traceable only to PRD §12.1/§12.2 routes:

```text
Logo (→ /)
Courses          → /courses
Hasil Rakitan     → /projects
Bundles           → /bundles
[Auth action: Login/Register if guest, Dashboard if learner]
```

No nav item without a backing PRD route (`Workshop`, `Mentors`, `Community` remain explicitly disallowed, per the original constraint — this exists because earlier visual-exploration tools invented navigation items not present in locked product scope). Desktop/mobile behavior is unchanged from the prior revision (horizontal nav on desktop; logo + auth action + menu/drawer on mobile, no item dropped).

## 9. Section Specifications

### 9.1 Hero

**Content (unchanged):**
- Brand: `DirakitPro`
- Headline: `Profesional itu dirakit.`
- Supporting copy: `Mulai dari rakitan pertama. Belajar dengan membangun website, aplikasi, dan produk digital yang benar-benar bisa kamu tunjukkan.`
- Primary CTA: `Mulai Merakit` → `/courses` (or a specific featured course's `/courses/[slug]`)
- Secondary CTA: `Lihat Hasil Rakitan` → `/projects`

**Purpose:** within the first viewport, communicate: learning platform + build real things + beginner-friendly + visible outcome.

**Visual:** a real-looking project preview (not generic illustration), with the assembly/build metaphor present but restrained.

**Visual direction:** Modern Maker friendliness + Digital Workshop assembly identity.

**Rhythm role:** expressive / welcoming — the most open, spacious section on the page.

**Data dependency:** STATIC MARKETING CONTENT (copy); hero visual may reference real project imagery once available.

### 9.2 Mau Merakit Apa?

**Merge note:** this section replaces the two previously separate sections `What Can You Build?` and `Featured Courses` — it is course discovery, featured-course presentation, and outcome preview at once, not three separate jobs split across two sections.

**Heading:** `Mau merakit apa?`

**Content:** the three initial course/build directions (PRD Appendix A): Personal Website, Personal Finance App, Business Booking System.

**Card priority:** project screenshot, project outcome, difficulty, estimated effort, price, CTA. Course metadata (stage count, duration) may appear as secondary detail. Explicitly not visually prioritized: instructor portrait, star rating, video count (DESIGN.md §17 Course Card rule, unchanged).

**CTA:** `Rakit Ini` (or the already-approved course-detail CTA vocabulary, for site-wide consistency — see §22 Acceptance Criteria).

**Note on §9.4 overlap:** the same three build directions also appear later in §9.4 (`Dari Kosong Sampai Jadi`) — this is intentional, not a duplication error, and the two must stay visually distinct: here, each is a **course card** (course-shopping framing: difficulty, price, "Rakit Ini" purchase-intent CTA); in §9.4, each is a **finished-output preview** (proof framing: large screenshot, "look what this becomes," no price or purchase CTA). If a design tool renders the same card component in both places, that is the duplication this document forbids — the underlying three topics recurring with a different presentation is expected.

**Visual direction:** Modern Maker + Editorial (modular tile cards carrying a strong preview image).

**Rhythm role:** visual project cards — the first clearly grid-like section on the page.

**Data dependency:** DYNAMIC COURSE DATA (pulls the same published-course data as `/courses`, per CAT-001).

### 9.3 Belajar dengan Merakit

**Merge note:** this section replaces the two previously separate sections `How DirakitPro Works` and `Signature Build Progress` — one major signature section communicating both *how the method works* and *what the product experience looks like*, rather than a process explainer followed by a separate component showcase.

**Heading:** `Belajar dengan merakit, bukan sekadar menonton.`

**Method — four steps, exact copy:**

```text
01 — Pilih Rakitan
Pilih sesuatu yang ingin kamu buat.

02 — Ikuti Langkahnya
Pelajari konsep seperlunya, lalu langsung praktik.

03 — Rakit Bagian demi Bagian
Setiap tahap membuat produkmu semakin jadi.

04 — Selesaikan Karyamu
Selesaikan project dan terbitkan jika kamu ingin membagikannya.
```

**Critical constraint (unchanged):** step 04 must not imply publishing is mandatory — PRD §10.7/PRJ-003 make publication explicitly optional and not a completion requirement.

**Connected Build Progress — shown prominently in this same section:**

```text
Rakit Personal Website                         68%

✓ Struktur
│
✓ Hero
│
✓ Tentang Saya
│
● Project Showcase
│
○ Contact
│
○ Responsive
│
○ Deploy
```

Must clearly distinguish Completed / Current / Upcoming / Optional-when-relevant through shape/icon, never color alone (unchanged core requirement, DESIGN.md §18.1/§25.5). It must communicate product assembly — it must not become a generic checklist, and it must not be reduced to merely a "68% progress bar" with the step list stripped away. This remains one of the most recognizable sections on the homepage, now made stronger by sharing a section with the method explanation that gives it context, rather than appearing as an disconnected showcase.

**Visual direction:** Digital Workshop — STRONG; Modern Maker — light support only.

**Rhythm role:** structured signature product section — the page's most distinctive section, denser and more purposeful than its neighbors.

**Data dependency:** STATIC PRODUCT METHOD (the four steps) + DEMO BUILD DATA (the Build Progress example — illustrative, not the visitor's own progress, since a guest has no enrollment yet).

### 9.4 Dari Kosong Sampai Jadi

**Merge note:** this section replaces the two previously separate sections `Outcome Proof` and `Learner Project Showcase` — one output-focused section rather than a narrative section followed by a separate gallery teaser.

**Heading:** `Dari kosong sampai jadi.`

**Purpose:** answer *"Kalau saya mengikuti DirakitPro, sebenarnya saya bisa menghasilkan apa?"*

**Outcome narrative:**

```text
START
blank / initial state

    ↓

BUILD
parts progressively assembled

    ↓

RESULT
finished digital product
```

**Hasil Rakitan preview:** 2–3 strong project previews drawn from the same three build directions (Personal Website, Personal Finance App, Business Booking System) — see §9.2's note on why this is not a duplication: here they are framed as finished output, not as purchasable course cards.

**Honesty rule (unchanged, strengthened):** for MVP/prototype, examples must be clearly marked `Demo Project` until real learner projects exist. Never fabricate learner names or outcomes.

**Visual direction:** Editorial Builder — STRONG; Digital Workshop — light transition support only (carrying the "assembly" framing from §9.3 into this section's opening narrative beat).

**Rhythm role:** spacious editorial output — generous whitespace, large screenshots, few items. This is now the single largest, calmest section on the page.

**Principle:** *"The interface steps back and the work becomes the hero"* (DESIGN.md §4).

**Data dependency:** DEMO PROJECT DATA initially; REAL CURATED PROJECT DATA once real learner output exists (same PUBLIC + APPROVED + FEATURED source as `/projects`, PRJ-006, when real).

### 9.5 Kenapa DirakitPro?

**Heading:** `Kenapa belajar di DirakitPro?`

**Four differentiators, exact copy (unchanged):**

```text
Outcome First
Mulai dari apa yang ingin kamu buat, bukan daftar teori yang harus dihafal.

Build as You Learn
Konsep hadir saat dibutuhkan dalam proses membangun.

Progress yang Terlihat
Lihat rakitanmu berkembang bagian demi bagian.

Karya yang Bisa Ditunjukkan
Akhiri course dengan sesuatu yang bisa dibuka, digunakan, dan dibagikan.
```

**Constraint (unchanged):** avoid generic LMS benefit language ("Materi berkualitas," "Belajar kapan saja," "Instruktur terbaik") unless future evidence makes those statements useful.

**Visual direction:** Modern Maker (concise value grid, not a dense feature-comparison table).

**Rhythm role:** concise value grid — compact, four equal-weight items, low visual noise.

**Data dependency:** STATIC MARKETING CONTENT.

### 9.6 Campaign / Bundle Spotlight — CONDITIONAL

**Placement:** after `Kenapa DirakitPro?`, before `FAQ`.

**Render condition:** only if at least one bundle is ACTIVE and within its campaign window (CAT-005/COM-006). If none: **section is entirely absent** — no placeholder, no "check back later." The page has 7 sections that day, not 8 with a gap.

**Example content (illustrative):**

```text
Paket Merdeka
Pilih bebas 2 course.
Rp299.000                              ← Sample Content, not final pricing
[ Pilih Rakitan ]
```

**Terminology rule (unchanged):** must support both `FIXED` and `CHOOSE_N` without exposing that vocabulary to customers.

**CTA destination:** `/bundles/[slug]` — an existing PRD route, never an invented one.

**Visual direction:** Modern Maker + a strong brand moment (may use `#0D47A1` as a strong background per DESIGN.md §7.4/§25.4, contrast preserved per §12).

**Rhythm role:** conditional strong moment — the one section allowed to visually interrupt the page's rhythm, since a live campaign is itself a temporary interruption to the product's normal cadence.

**Data dependency:** CONDITIONAL DYNAMIC DATA (renders only from live ACTIVE bundle data; price is sample content until real).

### 9.7 FAQ

Unchanged in content requirements from the prior revision. Minimum required questions and target answers:

| Question | Target answer | Dependency note |
|---|---|---|
| Apakah harus bisa coding dulu? | Tidak, untuk course beginner yang memang dirancang dari dasar. | STATIC — PRD §3.2 ICP |
| Apakah boleh menggunakan AI? | Ya. AI dapat digunakan sebagai alat bantu, tetapi learner tetap diarahkan memahami apa yang sedang dibangun. | STATIC — PRD §4.6 "AI is allowed" |
| Apa yang saya dapat setelah membeli course? | Akses penuh ke seluruh konten belajar dan build course yang dibeli. | STATIC — COM-001 |
| Apakah project wajib dipublikasikan? | Tidak. | STATIC — PRJ-003 |
| Bisa belajar lewat HP? | Materi dapat diakses melalui perangkat mobile, tetapi proses membangun project tertentu akan lebih nyaman atau dapat membutuhkan laptop/desktop. | STATIC — DESIGN.md §19 realistic mobile framing |
| Apakah ada sertifikat? | Fokus DirakitPro adalah hasil project yang bisa kamu tunjukkan, bukan sertifikat. | Certificate generation is explicitly P1/post-MVP (PRD §6.2, §19.2) — must not be advertised as available |
| Berapa lama akses course? | **CONTENT COPY DEPENDENCY** — not defined anywhere in PRD V1.0's commerce rules (§8.3, §10.8). Do not guess. Omit this question from the live FAQ until Product/Commerce defines the policy. | Flagged, not answered |

**Visual direction:** neutral utility — unchanged.

**Rhythm role:** quiet utility — the lowest-visual-energy section on the page, by design.

**Data dependency:** STATIC / MANAGED CONTENT for six of seven questions; the access-duration question remains a flagged CONTENT COPY DEPENDENCY.

### 9.8 Final CTA

Unchanged from the prior revision.

**Headline:** `Semua profesional pernah punya rakitan pertama.`

**Supporting copy:** `Mulai dari sesuatu yang bisa kamu buat hari ini.`

**Primary CTA:** `Mulai Rakitan Pertamamu` → same destination pattern as the hero's primary CTA.

**Visual treatment:** `#0D47A1` background moment permitted, accessibility preserved per §12 (white/near-white text on brand-900, not a low-contrast pairing). Nothing renders after this section except the footer.

**Visual direction:** Digital Workshop brand moment — closes the rhythm arc the hero opened.

**Rhythm role:** strong closing moment.

**Data dependency:** STATIC MARKETING CONTENT.

## 10. Future / Conditional Social Proof (not baseline)

```text
Status: DEFERRED — REAL DATA REQUIRED
```

Social Proof is **removed from the Homepage V1 baseline**. Reason: there is currently no real learner evidence that should be presented as production social proof, and the product's Trust and Honesty requirement (unchanged from the prior revision) prohibits shipping placeholder/fake testimonials, fake star ratings, fake member counts, fake project counts, or fake logos on a production page.

This section may be introduced later, **only when real evidence exists** — a genuine learner quote, a real learner project thumbnail, or a verified result. It is not deleted from the product's future design vocabulary, only withheld from the current baseline count (§7: 7 baseline sections, Social Proof is not one of them).

Recommended future placement, when reintroduced: after `Dari Kosong Sampai Jadi` (§9.4) or after `Kenapa DirakitPro?` (§9.5) — both keep it adjacent to output/trust-building content rather than isolated.

Until then: do not render this section at all, in any form, on the production homepage.

## 11. Footer

Unchanged from the prior revision:

```text
DirakitPro        → logo/home (/)
Courses           → /courses
Hasil Rakitan     → /projects
Bundles           → /bundles
About / Product Information   → informational placeholder (no PRD route yet)
Legal             → informational placeholder
Privacy           → informational placeholder
Terms             → informational placeholder
```

`About/Legal/Privacy/Terms` remain informational placeholders pending a future PRD/legal decision (PRD §18.4 Public Brand Release Gate) — not invented application routes, not designed as full pages in this document.

## 12. Accessibility

Unchanged from the prior revision, restated for the current section set: semantic heading hierarchy (one `<h1>` in the Hero, one `<h2>` per section, §9.1–§9.8 plus the conditional §9.6); full keyboard operability for header nav, both hero CTAs, all course/bundle/project cards, and the FAQ; visible 2px brand-700 focus rings; button contrast follows DESIGN.md §20 (brand-700 for normal-size white-on-blue text — relevant to §9.6 Campaign and §9.8 Final CTA's brand-900 background moments); Build Progress states (§9.3) use shape/icon, never color alone; 44×44px minimum touch targets; motion respects `prefers-reduced-motion`; meaningful `alt` text on course/project imagery, with course/project title, price, and difficulty always present as real text, never locked inside an image.

## 13. Motion

Unchanged from the prior revision: assembly blocks entering into position, the Connected Build Progress line filling as a one-time reveal (§9.3), a project preview resolving from draft → complete (§9.4's Beginning → Building → Finished framing) as a single reveal, not a loop. Avoid animating every card on scroll, continuous/looping elements, heavy parallax, bouncing CTAs, or anything competing with reading. All motion respects `prefers-reduced-motion` at implementation time.

## 14. Content & Data Dependencies

```text
01 Hero                    STATIC MARKETING CONTENT
02 Mau Merakit Apa?        DYNAMIC COURSE DATA
03 Belajar dengan Merakit  STATIC PRODUCT METHOD + DEMO BUILD DATA
04 Dari Kosong Sampai Jadi DEMO PROJECT DATA initially, REAL CURATED PROJECT DATA later
05 Kenapa DirakitPro?      STATIC MARKETING CONTENT
   Campaign (conditional)  CONDITIONAL DYNAMIC DATA
06 FAQ                     STATIC / MANAGED CONTENT (+ 1 flagged CONTENT COPY DEPENDENCY)
07 Final CTA                STATIC MARKETING CONTENT
Footer                      STATIC + informational placeholders

Future Social Proof (§10)   REAL USER DATA ONLY — never sample/placeholder in production
```

## 15. Analytics

Reconciled to the simplified IA — canonical PRD §13.1 events reused wherever the interaction's downstream page view already fires one; no new PRD-scope vocabulary invented.

| Interaction | Canonical PRD event | Note |
|---|---|---|
| Homepage viewed | `home_viewed` | Direct match, PRD §13.1 |
| Course/build card clicked (§9.2, → course detail) | `course_viewed` (fires on arrival at `/courses/[slug]`) | Single mapping now that `What Can You Build?` and `Featured Courses` are one section — the prior revision's duplicate row for two separate sections pointing at the same event is removed |
| Campaign clicked (§9.6, → bundle detail) | `bundle_viewed` (fires on arrival at `/bundles/[slug]`) | Unchanged |
| Primary CTA clicked ("Mulai Merakit" / "Mulai Rakitan Pertamamu") | — | **ANALYTICS IMPLEMENTATION DETAIL** — no canonical homepage-CTA-click event in PRD §13.1; downstream navigation already fires canonical events |
| Showcase CTA clicked ("Lihat Hasil Rakitan") | — | **ANALYTICS IMPLEMENTATION DETAIL** — no canonical "gallery viewed" event in PRD §13.1 |
| Project/demo item clicked (§9.4) | — | **ANALYTICS IMPLEMENTATION DETAIL** — no canonical project-card-click event in PRD §13.1 |
| FAQ item expanded/interacted (§9.7) | — | **ANALYTICS IMPLEMENTATION DETAIL** — no canonical FAQ-interaction event in PRD §13.1 |

## 16. Empty / Conditional States

- **No active campaign:** §9.6 is omitted entirely — 7 rendered sections, not 8 with a placeholder gap.
- **No real learner projects yet:** §9.4's Hasil Rakitan preview uses clearly labeled `Demo Project` examples.
- **No real learner evidence at all:** §10 (Future Social Proof) stays entirely unrendered — never invented.
- **Few courses (initial 3):** §9.2 must look intentional with exactly three cards — no empty placeholder slots, no framing that implies a much larger catalog is missing.

## 17. PRD Traceability

| Section | PRD references |
|---|---|
| Hero | CAT-001, CAT-002, §4.1, §4.4 |
| Mau Merakit Apa? | CAT-001, CAT-002, COM-001, Appendix A |
| Belajar dengan Merakit | §7.4 Journey B, PRJ-003 (publishing optional), BLD-001, BLD-002, BLD-003 |
| Dari Kosong Sampai Jadi | PRJ-006, PRJ-007, PRJ-008, Executive Summary |
| Kenapa DirakitPro? | §4.6 Product Principles, §2.3 Opportunity |
| Campaign / Bundle | CAT-005, COM-003, COM-004, COM-005, COM-006 |
| FAQ | IAM-001/005, §4.6 (AI allowed), COM-001, PRJ-003, §6.2 (certificates P1) |
| Final CTA | §4.4 Beginner-facing promise |
| Navigation / Footer | §12.1/§12.2 routes only; Legal/Privacy/Terms flagged pending, §18.4 |

## 18. Visual Asset Requirements

The homepage intentionally reuses a small set of assets rather than generating unique imagery per section. **Initial asset budget is locked to four reusable assets:**

| # | Asset | Purpose | Reused in |
|---|---|---|---|
| 01 | `hero-assembly-preview.png` | Homepage Hero (§9.1) | A Personal Website project visibly mid-assembly |
| 02 | `personal-website-preview.png` | Mau Merakit Apa? (§9.2), Dari Kosong Sampai Jadi (§9.4) | Reused as-is across both framings (course card vs. output preview treatment differs at the component level, not the source image) |
| 03 | `personal-finance-preview.png` | Mau Merakit Apa? (§9.2), Dari Kosong Sampai Jadi (§9.4) | Same reuse pattern as Asset 02 |
| 04 | `business-booking-preview.png` | Mau Merakit Apa? (§9.2), Dari Kosong Sampai Jadi (§9.4) | Same reuse pattern as Asset 02 |

**Explicitly not rasterized as images:** Connected Build Progress, FAQ, buttons, course metadata (price/difficulty/duration text) — these remain live interface components, not baked into imagery.

Goal: minimal assets, maximum reuse. Do not create placeholder PNG files in the repository ahead of a real generated artifact — asset directories under `docs/design/assets/homepage/` and `docs/design/references/homepage/` are created only when a real file is ready to be stored there, not speculatively.

## 19. Design Tool Roles

```text
DESIGN.md
+
HOMEPAGE.md
        ↓
Claude Design  →  full-page composition
        ↓
Google Stitch  →  reusable visual assets (§18)
        ↓
Final Homepage reference
```

**Claude Design — current composition reference:**

```text
Current composition reference: Claude Design Homepage V1
Role:      layout/composition reference only
Authority: NON-AUTHORITATIVE
Source of truth remains: DESIGN.md + HOMEPAGE.md
```

The Claude-generated Homepage (`claude_DirakitPro_visual/DirakitPro Homepage.dc.html`, kept locally, untracked — see repository note below) is useful for page rhythm, section composition, spacing, typographic hierarchy, and full-page cohesion. It does **not** override the simplified IA in §7 — where the Claude reference and this document disagree (e.g. if it still shows 13 sections, a standalone Featured Courses, or Learning Progression), this document wins and the reference should be treated as due for an update, not the other way around.

**Google Stitch — visual asset & focused section producer:**

Stitch is no longer used to own the full-page Homepage composition. Its role is producing the four reusable assets in §18, and/or individual sections when a focused re-generation is needed (per `STITCH_MASTER_PROMPT.md`'s updated guidance on complex screens). Full-page composition remains governed by this document and `DESIGN.md`, regardless of which tool touches which piece.

**Repository note:** raw design-tool workbenches (`claude_DirakitPro_visual/`, `stitch_DirakitPro_visual/`) are local-only and git-ignored (see `.gitignore`) — they are not committed, and are not a substitute for this document. Superseded A/B/C direction exploration files and obsolete full-page Stitch attempts have been removed from both local workbenches as part of this remediation; only the current Claude Homepage composition reference (`DirakitPro Homepage.dc.html` + `support.js`) remains locally, and even that is temporary/untracked.

## 20. Stitch / Claude Design Instructions

Whichever tool touches Homepage visuals, generated output must not:

- render more than 7 baseline sections (8 with an active campaign) or in a different order than §7;
- reintroduce a standalone `Featured Courses`, `How DirakitPro Works`, `Signature Build Progress`, `Outcome Proof`, or `Learner Project Showcase` section — these are merged per §9;
- render a baseline Social Proof/testimonial section — §10 is deferred, not baseline;
- render the Learning Progression / STARTER-BUILDER-ENGINEERED-PRODUCTION-PRO ladder on the homepage — it lives in `DESIGN.md` as a brand framework, not here;
- add navigation items or CTA destinations not backed by a PRD §12 route;
- invent testimonials, learner names, projects, or aggregate stats not explicitly marked as sample/demo content;
- replace Connected Build Progress (§9.3) with a generic progress bar, percentage ring, or checklist;
- change the locked brand palette or introduce a second brand hue;
- imply project publication is required for course completion (§9.3 constraint);
- answer the "Berapa lama akses course?" FAQ question with an invented policy (§9.7);
- generate more than the four-asset budget (§18) as unique per-section imagery.

## 21. Acceptance Criteria

A Homepage visual design is acceptable for review only if:

- Exactly 7 baseline sections render in the §7 order, with the Campaign section correctly present only when a bundle is ACTIVE (8 total that day) and correctly absent otherwise.
- The three merges (§9.2, §9.3, §9.4) each read as one coherent section, not two sub-sections awkwardly stacked.
- Every CTA and nav link resolves to a route in `SCREEN_INVENTORY.md`/PRD §12.
- Connected Build Progress (§9.3) is visually distinguishable from a generic progress bar and preserves all four states via shape, not color alone.
- No fabricated social proof appears anywhere on the page (§10 stays unrendered until real data exists).
- Publishing is never implied as mandatory.
- The per-section visual-direction allocation (§9, and the Direction Allocation reference table below) is recognizable without the page reading as either uniformly one direction or three unrelated languages stitched together.
- Color balance follows DESIGN.md §25.8 (neutral-dominant, blue as accent, brand-900 reserved for Hero/Campaign/Final CTA strong moments).
- Mobile behavior for §9.2 (single-column cards), §9.3 (method first, then vertical Connected Build Progress, never compressed past legibility), and §9.4 (large, non-shrunk imagery) matches the responsive rules restated in each section.
- No more than the four approved reusable assets (§18) are used as unique imagery; interface components (progress, FAQ, buttons, metadata) are not baked into images.

### Direction Allocation (reference table)

| Section | Primary Influence |
|---|---|
| Hero | Modern Maker + Digital Workshop |
| Mau Merakit Apa? | Modern Maker + Editorial |
| Belajar dengan Merakit | Digital Workshop |
| Dari Kosong Sampai Jadi | Editorial Builder |
| Kenapa DirakitPro? | Modern Maker |
| Campaign (conditional) | Modern Maker + strong brand moment |
| FAQ | Neutral utility |
| Final CTA | Digital Workshop brand moment |

### Visual Rhythm (reference)

```text
Hero                      expressive / welcoming
Mau Merakit Apa?          visual project cards
Belajar dengan Merakit    structured signature product section
Dari Kosong Sampai Jadi   spacious editorial output
Kenapa DirakitPro?        concise value grid
Campaign (conditional)    strong moment
FAQ                       quiet utility
Final CTA                 strong closing brand moment
```

## 22. Design Status

```text
Homepage Product / UX Specification:  READY FOR VISUAL DESIGN
Homepage IA:                           V1.1 — SIMPLIFIED (7 baseline + 1 conditional)
Homepage Visual Design:                IN PROGRESS (Claude composition reference exists, non-authoritative)
Homepage Design Lock:                  NOT LOCKED
```

This document does not constitute a homepage design lock. The Claude Homepage composition reference (§19) is a useful layout/rhythm reference but does not by itself satisfy §21's Acceptance Criteria — the four Stitch visual assets (§18) still need to be produced and integrated, and the resulting composition still needs a responsive review, before any "Homepage Design — LOCKED" status can be claimed.
