# DirakitPro Homepage Product & UX Specification

## 1. Status

```text
Homepage Product / UX Specification: READY FOR VISUAL DESIGN
```

This is a specification, not a visual design. No homepage has been generated in Google Stitch or Claude Design yet. This document is what Design Session 3B will use as source context to do that.

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
Google Stitch / Claude Design (rendering/exploration only)
```

## 2. Purpose

The homepage exists to move an interested beginner through a specific sequence of questions, in order, without ever presenting DirakitPro as a generic course marketplace:

```text
What is DirakitPro?
↓
What can I build?
↓
How does learning here work?
↓
How is this different from a normal LMS?
↓
What will I actually produce?
↓
Can someone like me do this?
↓
What can I start today?
```

It converts an interested visitor into either **Course Discovery** (browsing `/courses`, `/courses/[slug]`) or a **First Build Start** (entering checkout for a specific course or bundle).

## 3. User

Primary: Guest, per `SCREEN_INVENTORY.md`'s Wave 1 entry for `/`. Ages ~18–30, Indonesia, beginner or early-stage learner — students, fresh graduates, career switchers, non-technical people exploring digital products, early junior developers (PRD §3.2, DESIGN.md §5). Secondary: a returning Learner may also land here (e.g. via a shared link or search), but the homepage is not optimized for them — `/dashboard` is their real home.

Target feeling on exit from this page: *"Saya mungkin belum jago, tapi saya bisa mulai."* Never: *"Platform ini hanya untuk programmer senior."*

## 4. Product Goals

- Communicate the outcome-first positioning (PRD §4.1, Executive Summary) within roughly one viewport.
- Prove, not just claim, that learners build real, visible things.
- Differentiate DirakitPro from a generic video-course catalog without using the word "LMS" as positioning (PRD §4.1).
- Introduce Build Progress as a distinctive, memorable product mechanic.
- Surface an active bundle campaign when one exists, without ever implying one always exists.

## 5. Conversion Goals

Primary conversion: **Course Discovery** or **First Build Start** — i.e., the visitor either continues browsing with clear intent (`/courses`, a specific `/courses/[slug]`) or begins a purchase (`/checkout/course/[courseSlug]`, `/checkout/bundle/[bundleSlug]`) via the Wave 1/Wave 3 routes already defined in `SCREEN_INVENTORY.md`. Secondary conversion: visiting `/projects` (Wave 2) to build trust before committing. The homepage itself performs no checkout logic — it only routes toward these existing screens.

## 6. Visual Direction

Per `DESIGN.md` §25 (Hybrid Digital Workshop V1), the homepage sits closer to the Modern Maker end of the hybrid than the learning workspace does:

```text
Digital Workshop     Medium
Modern Maker          Strong
Editorial Builder     Medium
```

Intent: approachable entry (Modern Maker) + a distinctive build metaphor (Digital Workshop) + a visible project outcome (Editorial Builder) — see §9 below for how this allocation varies **by section**, since a single flat ratio for the whole page would produce exactly the "13 stacked identical cards" problem this spec is designed to avoid (§14 Homepage Visual Rhythm in the governing brief; reflected in the per-section rhythm notes in §9).

## 7. Information Architecture

Locked homepage V1 section order:

```text
01 Hero
02 Outcome Proof
03 What Can You Build?
04 How DirakitPro Works
05 Signature Build Progress
06 Featured Courses
07 Learner Project Showcase
08 Why DirakitPro
09 Learning Progression
10 Campaign / Bundle Spotlight   (CONDITIONAL — omitted entirely if no ACTIVE bundle)
11 Social Proof
12 FAQ
13 Final CTA
```

All sections except §10 are baseline sections that always render. No section may be reordered, removed, or added by a design tool without this document being updated first (see §18).

## 8. Navigation

**Public navigation (all viewports), traceable to PRD §12.1/§12.2 routes only:**

```text
Logo (→ /)
Courses          → /courses
Hasil Rakitan     → /projects
Bundles           → /bundles
[Auth action: Login/Register if guest, Dashboard if learner]
```

`Hasil Rakitan` is the brand-vocabulary label for the public showcase route (`/projects`), consistent with DESIGN.md §21's vocabulary table ("Student Projects → Hasil Rakitan / Karya Learner"). `Bundles` only needs to appear as a persistent nav item if it earns its place — if no bundle is ever ACTIVE for an extended period, treat it as optional in nav (it remains reachable via `/bundles` regardless, and via the homepage's own conditional §10 section when relevant).

**Explicitly not permitted:** `Workshop`, `Mentors`, `Community`, or any other nav item not backed by a route in PRD §12. This constraint exists because earlier visual-exploration tools invented navigation items not present in the locked product scope — every homepage nav item must trace to an actual PRD route.

**Desktop:** horizontal nav in the marketing header (DESIGN.md §17 Navigation — marketing header pattern: logo, nav links, CTA, transparent-to-solid on scroll).

**Mobile:** logo + auth action + hamburger/menu affordance revealing the same three links (Courses, Hasil Rakitan, Bundles) in a full-screen or drawer menu. No nav item is dropped on mobile — if space is tight, the auth action may collapse to an icon.

## 9. Section Specifications

### 9.1 Hero

**Objective:** explain DirakitPro within approximately one viewport: this is a learning platform, I will build something, it is beginner-friendly, the result can be shown.

**Content:**
- Brand: `DirakitPro`
- Headline: `Profesional itu dirakit.`
- Supporting copy: `Mulai dari rakitan pertama. Belajar dengan membangun website, aplikasi, dan produk digital yang benar-benar bisa kamu tunjukkan.`
- Primary CTA: `Mulai Merakit` → `/courses` (or a specific featured course's `/courses/[slug]` if the design elects to feature one course in the hero; either destination already exists in `SCREEN_INVENTORY.md`)
- Secondary CTA: `Lihat Hasil Rakitan` → `/projects`

**Visual:** realistic learner-project preview + subtle build stages / connected assembly concept. Explicitly not: generic illustration, graduation cap, random abstract gradient, generic stock laptop photo.

**Visual direction allocation:** Digital Workshop 45% / Modern Maker 40% / Editorial 15% — must remain beginner-friendly despite the Digital Workshop presence (i.e. any blueprint/grid texture per DESIGN.md §25.6 stays a restrained accent, not a dominant technical surface).

**Rhythm role:** open / expressive — the loosest, most spacious section on the page (DESIGN.md §9/§10 marketing spacing at the high end, e.g. space-20/24).

**Data dependency:** STATIC MARKETING CONTENT (copy) + DYNAMIC PRODUCT DATA (if the hero visual references a specific real project screenshot rather than a generic composed scene).

### 9.2 Outcome Proof

**Headline:** `Bukan sekadar selesai menonton. Ada yang jadi di akhirnya.`

**Purpose:** immediately prove the outcome-first positioning by showing a Beginning → Building → Finished Project progression (e.g. blank/starter state → several assembled stages → live personal website, or a Day 1 → Final Result framing). Project output must visually dominate this section.

**Honesty rule:** if no real learner results exist yet at time of launch, examples must be clearly labeled `Demo Project` or `Example Build` — never presented as real learner output when they are not (DESIGN.md's imagery rule, §14, plus the Trust and Honesty requirement in §16 below).

**Visual direction:** predominantly Editorial Builder (large screenshot, restrained chrome) layered over the Digital Workshop "stages" framing.

**Rhythm role:** large editorial visual — visually the biggest single image on the page after the hero.

**Data dependency:** REAL USER CONTENT if available, otherwise SAMPLE DESIGN DATA clearly labeled per the honesty rule.

### 9.3 What Can You Build?

**Heading:** `Mau merakit apa?`

**Purpose:** reframe the catalog mental model from "what course should I watch" to "what do I want to build." Initial examples align to the three PRD-locked courses (PRD Appendix A): Rakitan Pertama — Personal Website, Rakit Aplikasi Keuangan Pribadi, Rakit Sistem Booking Bisnis.

**Card priority:** project preview, project outcome, difficulty, estimated effort, price, CTA — explicitly not instructor, rating, or video count (matches DESIGN.md §17 Course Card rule).

**CTA:** `Rakit Ini` (or the equivalent already used on `/courses/[slug]`'s primary CTA if a single vocabulary is preferred site-wide — see §19 Acceptance Criteria for the consistency check this implies).

**Visual direction:** Modern Maker (modular tile cards, per DIRECTION_A's card style).

**Rhythm role:** structured cards — the first genuinely grid-like section on the page.

**Data dependency:** DYNAMIC PRODUCT DATA (pulls the same published-course data as `/courses`, per CAT-001).

### 9.4 How DirakitPro Works

**Heading:** `Belajarnya seperti apa?`

**Four steps, exact copy:**

```text
01 — Pilih Rakitan
Pilih sesuatu yang ingin kamu buat.

02 — Ikuti Langkahnya
Pelajari konsep seperlunya, lalu langsung praktik.

03 — Rakit Bagian demi Bagian
Setiap tahap membuat produkmu semakin jadi.

04 — Terbitkan Karyamu
Selesaikan, deploy, dan tunjukkan hasilnya jika kamu mau.
```

**Critical constraint:** step 04's copy ("...jika kamu mau") must not be softened into implying publishing is required — PRD §10.7/PRJ-003 make publication explicitly optional and not a completion requirement. This section describes the full possible journey, not a mandatory one.

**Visual direction:** Digital Workshop (structured, numbered, process-oriented — this is where the direction's step-numbering/annotation register, per DIRECTION_B, is most appropriate on the homepage).

**Rhythm role:** compact process — a denser, more utilitarian section than its neighbors, intentionally.

**Data dependency:** STATIC MARKETING CONTENT.

### 9.5 Signature Build Progress

**Heading:** `Kamu selalu tahu sedang merakit bagian yang mana.`

**Purpose:** a dedicated, oversized showcase of the Connected Build Progress signature component (DESIGN.md §18.1/§25.5) — significantly larger here than its in-product footprint, since this section's job is to make the mechanic memorable, not to function as live progress.

**Example content (illustrative, matches DESIGN.md §18.1's Workspace variant — Vertical Assembly Timeline):**

```text
Rakit Personal Website                         68%

✓ Struktur
✓ Hero
✓ Tentang Saya
● Project Showcase
○ Contact
○ Responsive
○ Deploy
```

**Supporting copy:** `Tidak perlu bingung harus belajar apa berikutnya. Setiap course membawa rakitanmu maju tahap demi tahap sampai menjadi hasil yang utuh.`

**Visual direction:** strongly Digital Workshop — this section is the homepage's clearest expression of that influence, consistent with DESIGN.md §25.4 marking Learning Workspace/Build Progress as the primary home of this direction.

**Rhythm role:** signature visual section — the page's most distinctive, least card-like section; nothing before or after it should visually resemble it.

**Data dependency:** SAMPLE DESIGN DATA on the homepage (this is a demonstration of the mechanic, not a live per-visitor progress state — the visitor has no enrollment yet). Must not be mistaken for real dynamic data; if labeling is needed to prevent confusion, use a small "contoh tampilan" (example view) caption rather than presenting it as the visitor's own progress.

### 9.6 Featured Courses

**Heading:** `Rakitan yang bisa kamu mulai sekarang`

**Card structure (illustrative):**

```text
Project Preview

Rakit Personal Website

Pemula · 6–8 jam

Yang akan kamu buat:
✓ Hero
✓ Tentang Saya
✓ Project Showcase
✓ Responsive
✓ Deploy

Rp299.000

[ Rakit Course Ini ]
```

**Pricing rule:** any price shown in this specification (e.g. `Rp299.000` above) is `Sample Content` for layout/design purposes only — it is not permanent business policy and must not be hardcoded into a visual design as if it were final pricing. Actual prices are admin-configurable per PRD §8.3/COM-001 and Appendix A ("Harga retail tidak di-hardcode dalam PRD").

**Visual direction:** Modern Maker + Editorial Builder (tile cards carrying a strong project-preview image).

**Rhythm role:** modular cards — a return to grid structure after the signature section's departure from it.

**Data dependency:** DYNAMIC PRODUCT DATA (published courses, same source as `/courses`).

### 9.7 Learner Project Showcase

**Heading:** `Hasil Rakitan`

**Supporting line:** `Lihat apa yang berhasil dirakit learner lain.`

**Purpose:** show real (or clearly labeled demo) learner output with minimal framing — the interface steps back, the work becomes the hero, per DESIGN.md §4's "System leads while learning, work leads once it's done" principle and §25.3.

**Priority order:** large project screenshot, project title, learner display name, short description, view-project action. Do not over-frame with heavy card chrome (no strong borders/shadows — whitespace does the separating, per Editorial Builder's card style).

**Honesty rule:** if no real learner projects exist yet, use clearly labeled demo projects. Never fabricate learner names, projects, or testimonials and present them as real (§16 below).

**Visual direction:** predominantly Editorial Builder.

**Rhythm role:** spacious editorial — large images, generous whitespace, few items.

**Data dependency:** DYNAMIC PRODUCT DATA / curated — pulls from the same PUBLIC + APPROVED + FEATURED set as `/projects` (PRJ-006), or REAL USER CONTENT once available; SAMPLE DESIGN DATA with explicit "Demo Project" labeling before that.

### 9.8 Why DirakitPro

**Heading:** `Kenapa belajar di DirakitPro?`

**Four differentiators, exact copy:**

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

**Constraint:** avoid generic LMS benefit language ("Materi berkualitas," "Belajar kapan saja," "Instruktur terbaik") — these differentiators must stay specific to the outcome-first thesis. Copy must not overpromise production-grade quality for beginner work.

**Visual direction:** Modern Maker (a concise value grid, not a dense feature-comparison table).

**Rhythm role:** concise value grid — compact, four equal-weight items, low visual noise.

**Data dependency:** STATIC MARKETING CONTENT.

### 9.9 Learning Progression

**Heading:** `Rakitan pertama bukan rakitan terakhir.`

**Purpose:** communicate the long-term philosophy (PRD §19.1 product ladder: Build → Understand → Engineer → Production → Scale) without expanding MVP scope or implying every tier already has shipped courses.

**Conceptual progression (illustrative labels, not literal PRD tier names — see PRD §19.1 for the canonical ladder):**

```text
STARTER      Rakitan Pertama
    ↓
BUILDER      Rakitan Fungsional
    ↓
ENGINEERED   Rakitan Terstruktur
    ↓
PRODUCTION   Rakitan Siap Digunakan
    ↓
PRO          Rakitan Profesional
```

**Constraint:** this is a brand/learning-progression model, not a course catalog claim. Do not add "COMING SOON" tags to every future tier — prefer a conceptual journey framing with no fake launch commitments. The section should communicate that the standard of what you build improves as your skills improve, not that four more course tiers ship on a defined date.

**Visual direction:** Digital Workshop (structured journey, matches the ladder's own sequential framing).

**Rhythm role:** structured journey — a clear step sequence, visually related to §04's process section but framed at the brand/philosophy level rather than the single-course level.

**Data dependency:** STATIC MARKETING CONTENT.

### 9.10 Campaign / Bundle Spotlight — CONDITIONAL

**Render condition:** only if at least one bundle is ACTIVE and within its campaign window (CAT-005/COM-006). If no bundle is ACTIVE: **do not render this section at all** — no empty placeholder, no "check back later" message. The page simply has 12 sections that day, not 13 with a gap.

**Example content (illustrative):**

```text
Paket Merdeka
Pilih bebas 2 course.
Rp299.000                              ← Sample Content, not final pricing
[ Pilih Rakitan ]
```

**Terminology rule:** the section must support both `FIXED` and `CHOOSE_N` bundle types without exposing that technical vocabulary to the customer — copy should read as "pilih course" / "paket ini sudah termasuk course berikut" rather than naming the bundle type.

**CTA destination:** `/bundles/[slug]` (existing PRD route) — this section never invents a new route; it is a homepage teaser for a bundle detail page that already exists in `SCREEN_INVENTORY.md`'s Wave 2.

**Visual direction:** Modern Maker for approachable framing, with a high-contrast moment (may use `#0D47A1` as a strong background per DESIGN.md §25.4/§7.4, as long as accessible contrast rules in §20 are preserved).

**Rhythm role:** high-contrast optional moment — deliberately the one section allowed to visually interrupt the page's rhythm, since a live campaign is itself a temporary interruption in the product's normal cadence.

**Data dependency:** CONDITIONAL DATA (renders only from live ACTIVE bundle data; price shown is DYNAMIC PRODUCT DATA once real, SAMPLE DESIGN DATA for layout purposes now).

### 9.11 Social Proof

**Purpose:** address the beginner anxiety of "Apakah saya benar-benar bisa?"

**Preferred testimonial pattern (illustrative):** `"Sebelumnya saya belum pernah deploy website. Setelah menyelesaikan rakitan pertama, akhirnya saya punya personal website yang bisa dibuka orang lain."` — output/transformation-focused, ideally paired with a small project preview.

**Absolute constraint (Trust and Honesty, §16):** no fabricated testimonials in production. Design prototypes must label placeholder testimonials explicitly as `Sample Testimonial` or equivalent. No fake aggregate stats (`10,000 learners`, `4.9/5`, `500 projects`) unless backed by real data at the time of implementation.

**Fallback:** if no real testimonials exist yet, this section may be omitted entirely from the live page until real proof exists — omission is preferable to fabrication.

**Visual direction:** Editorial / neutral — calm, restrained, text-forward.

**Rhythm role:** calmer proof — a quiet section, intentionally lower-energy than the sections before and after it.

**Data dependency:** REAL USER CONTENT when available; otherwise this section is a candidate for omission (see §16 Empty/Conditional States).

### 9.12 FAQ

Minimum required questions and target answers:

| Question | Target answer | Dependency note |
|---|---|---|
| Apakah harus bisa coding dulu? | Tidak, untuk course beginner yang memang dirancang dari dasar. | STATIC — supported by PRD positioning (§3.2 ICP, "tanpa harus sudah menjadi programmer") |
| Apakah boleh menggunakan AI? | Ya. AI dapat digunakan sebagai alat bantu, tetapi learner tetap diarahkan memahami apa yang sedang dibangun. | STATIC — supported by PRD §4.6 "AI is allowed" principle |
| Apa yang saya dapat setelah membeli course? | Akses penuh ke seluruh konten belajar dan build course yang dibeli. | STATIC — supported by COM-001 |
| Apakah project wajib dipublikasikan? | Tidak. | STATIC — supported by PRJ-003 |
| Bisa belajar lewat HP? | Materi dapat diakses melalui perangkat mobile, tetapi proses membangun project tertentu akan lebih nyaman atau dapat membutuhkan laptop/desktop. | STATIC — matches DESIGN.md §19 realistic mobile framing, does not promise mobile-only build capability |
| Apakah ada sertifikat? | No certificate claim in MVP copy. | Certificate generation is explicitly P1 (PRD §6.2) / post-MVP roadmap (§19.2), not shipped in MVP — FAQ must not advertise it. Suggested honest answer: "Fokus DirakitPro adalah hasil project yang bisa kamu tunjukkan, bukan sertifikat." |
| Berapa lama akses course? | **CONTENT COPY DEPENDENCY** — PRD V1.0 does not define an access-duration policy (lifetime vs. time-limited) anywhere in its commerce rules (§8.3, §10.8). Do not guess an answer. This question must not be answered in copy until Product/Commerce defines the policy; omit the question from the live FAQ until then, or answer only once a rule exists. |

**Visual direction:** neutral utility — an accordion or simple Q&A list, no heavy visual treatment.

**Rhythm role:** utility — the lowest-visual-energy section on the page, by design.

**Data dependency:** STATIC MARKETING CONTENT for six of seven questions; the access-duration question is a flagged CONTENT COPY DEPENDENCY (see table) and must not ship with an invented answer.

### 9.13 Final CTA

**Headline:** `Semua profesional pernah punya rakitan pertama.`

**Supporting copy:** `Mulai dari sesuatu yang bisa kamu buat hari ini.`

**Primary CTA:** `Mulai Rakitan Pertamamu` → same destination pattern as the hero's primary CTA (`/courses` or a specific featured course).

**Visual treatment:** may use `#0D47A1` (brand-900) as a strong background moment, provided accessibility is preserved — per DESIGN.md §7.1/§20, text on a brand-900 background should default to white/near-white for contrast, not brand-500-on-brand-900 or similar low-contrast combinations. Keep the section visually simple; no additional content renders after this section except the footer.

**Visual direction:** Digital Workshop brand moment — the page's other strong `#0D47A1` moment besides the optional campaign section, and the intended closing "signature" feeling.

**Rhythm role:** strong closing moment — second-most-expressive section on the page after the hero, closing the rhythm arc the hero opened.

**Data dependency:** STATIC MARKETING CONTENT.

## 10. Footer

Groups, each link only rendered if it maps to an existing PRD route or a clearly-marked informational placeholder:

```text
DirakitPro        → logo/home (/)
Courses           → /courses
Hasil Rakitan     → /projects
Bundles           → /bundles
About / Product Information   → informational placeholder (no PRD route yet — see note)
Legal             → informational placeholder
Privacy           → informational placeholder
Terms             → informational placeholder
```

**Constraint:** `About / Product Information`, `Legal`, `Privacy`, and `Terms` are not defined as routes anywhere in PRD V1.0 §12. They are standard footer expectations for any commercial product (and the PRD's Public Brand Release Gate, §18.4, implies legal pages will eventually exist), but they must be treated as **informational placeholders pending a future PRD/legal decision**, not invented application routes with designed screens. Do not add them to `SCREEN_INVENTORY.md` as if they were product-locked routes; do not design full pages for them in this session.

## 11. Responsive Behavior

**Hero:** Desktop — copy alongside the project/build visual (two-region layout). Mobile — copy, then CTA, then visual (stacked, in that order) per the governing brief; do not place small side-by-side project previews on mobile.

**Build/course cards (§9.3, §9.6):** Desktop — multiple columns (2–3, matching DESIGN.md §9's 12-column grid). Mobile — single column, or horizontal snap-scroll only if usability remains good (large touch targets, clear scroll affordance) — never a snap-scroll that hides content with no visual cue more exists.

**Build Progress (§9.5):** Desktop — the Vertical Assembly Timeline (or a structured multi-column representation) is allowed at full size. Mobile — prefer the vertical connected form over any horizontal compression, since horizontal compression tends to sacrifice the step labels that make the mechanic legible (aligns with DESIGN.md §19's "prefer vertical connected progress" mobile rule).

**Project Showcase (§9.7):** large project screenshots must remain genuinely readable on mobile — do not shrink desktop compositions into thumbnails; reduce the number of projects shown per viewport instead of shrinking each one.

**Campaign (§9.10):** CHOOSE_N course-selection mechanics are never implemented on the homepage itself — the homepage only communicates the offer and links to `/bundles/[slug]`, which is where PRD-defined selection behavior (COM-005) actually lives.

## 12. Accessibility

Per DESIGN.md §20, applied specifically to this page:

- Semantic heading hierarchy: one `<h1>` (the Hero headline), each of the 12–13 sections uses an `<h2>` for its heading, consistent heading order with no skipped levels.
- Full keyboard navigation for the header nav, both hero CTAs, every course/bundle/project card link, and the FAQ (if implemented as an accordion, it must be keyboard-operable and expose expanded/collapsed state to assistive tech).
- Visible focus states on every interactive element (2px brand-700 ring per DESIGN.md §20 — no `outline: none` without a replacement).
- Button/CTA contrast follows DESIGN.md §20's brand-700-for-normal-text / brand-500-for-large-text distinction — this applies directly to the Final CTA (§9.13) and Campaign (§9.10) sections, which are the two candidates for a brand-900 background with white text at standard CTA size.
- No state communicated by color alone: Build Progress states (§9.5) use shape/icon distinctions (✓ / ● / ○), not color alone, consistent with the signature component's core requirement.
- Touch targets: all CTA buttons and card tap areas meet the 44×44px minimum (DESIGN.md §20).
- Reduced motion: all motion in §13 below must degrade to an instant state change under `prefers-reduced-motion`.
- Alt text strategy: course/project screenshots carry meaningful `alt` text describing the actual output shown (e.g. "Tampilan dashboard aplikasi keuangan pribadi buatan learner"); purely decorative illustration/texture uses empty `alt=""`. Screenshots must never be the *only* place required information exists — course difficulty/price/duration and project title/author must exist as real text nearby, not only as pixels inside an image.

## 13. Motion

Homepage-appropriate motion, per DESIGN.md §16 and the governing brief:

- Assembly blocks entering into position (e.g. the Outcome Proof or Build Progress section revealing its stages progressively on scroll-into-view).
- The Connected Build Progress line filling (§9.5), as a one-time reveal, not a looping animation.
- A project preview resolving from draft → complete (§9.2's Beginning → Building → Finished framing), as a single reveal transition, not a repeating loop.

**Explicitly avoid:** animating every card on scroll, continuous/looping floating elements, heavy parallax, a bouncing CTA, or any motion that competes with reading. All motion must respect `prefers-reduced-motion` at implementation time (this spec does not implement it, but no motion described here is exempt from that requirement).

## 14. Content & Data Dependencies

Consolidated from each section's individual dependency note in §9:

```text
01 Hero                       STATIC + DYNAMIC PRODUCT DATA (optional hero visual)
02 Outcome Proof              REAL USER CONTENT / SAMPLE DESIGN DATA (labeled)
03 What Can You Build?        DYNAMIC PRODUCT DATA
04 How DirakitPro Works       STATIC MARKETING CONTENT
05 Signature Build Progress   SAMPLE DESIGN DATA (illustrative, not per-visitor)
06 Featured Courses           DYNAMIC PRODUCT DATA
07 Learner Project Showcase   DYNAMIC PRODUCT DATA (curated) / REAL USER CONTENT / SAMPLE DESIGN DATA (labeled)
08 Why DirakitPro             STATIC MARKETING CONTENT
09 Learning Progression       STATIC MARKETING CONTENT
10 Campaign / Bundle          CONDITIONAL DATA
11 Social Proof               REAL USER CONTENT (or omitted — see §16)
12 FAQ                        STATIC MARKETING CONTENT (6 of 7) + 1 flagged CONTENT COPY DEPENDENCY
13 Final CTA                  STATIC MARKETING CONTENT
Footer                        STATIC + informational placeholders (§10)
```

## 15. Analytics

Mapped to canonical PRD §13.1 event names where one exists; otherwise flagged rather than inventing new PRD-scope vocabulary.

| Interaction | Canonical PRD event | Note |
|---|---|---|
| Homepage viewed | `home_viewed` | Direct match, PRD §13.1 |
| Course card clicked (→ course detail) | `course_viewed` (fires on arrival at `/courses/[slug]`) | No separate "card clicked" event exists in PRD; the resulting page-view event is canonical |
| Bundle/campaign clicked (→ bundle detail) | `bundle_viewed` (fires on arrival at `/bundles/[slug]`) | Same pattern as above |
| Primary CTA clicked ("Mulai Merakit" / "Mulai Rakitan Pertamamu") | — | **ANALYTICS IMPLEMENTATION DETAIL** — no canonical homepage-CTA-click event in PRD §13.1; the downstream navigation already fires `course_viewed`/`checkout_started` etc. A homepage-specific click event, if desired, is an implementation detail for the analytics layer, not a PRD scope change |
| Secondary CTA clicked ("Lihat Hasil Rakitan") | — | **ANALYTICS IMPLEMENTATION DETAIL** — same reasoning; arrival at `/projects` has no canonical "gallery viewed" event in PRD §13.1 either |
| Project showcase item clicked | — | **ANALYTICS IMPLEMENTATION DETAIL** — no canonical project-card-click or project-view event in PRD §13.1 |
| FAQ item expanded/interacted | — | **ANALYTICS IMPLEMENTATION DETAIL** — no canonical FAQ-interaction event in PRD §13.1 |

No duplicate or competing event vocabulary is introduced here — where a canonical PRD event covers the interaction via its natural downstream page view, that event is reused rather than inventing a homepage-specific duplicate.

## 16. Empty / Conditional States

- **No active campaign:** §9.10 (Campaign/Bundle Spotlight) is omitted entirely — the page has 12 rendered sections, not 13 with a placeholder gap.
- **No real learner projects yet:** §9.7 (Learner Project Showcase) uses clearly labeled demo projects (`Demo Project` / `Example Build`), or is reduced to a smaller demonstration section — never fabricated as real.
- **No testimonials yet:** §9.11 (Social Proof) may be omitted from the live page entirely until real proof exists. Never invented.
- **Few courses (initial 3):** §9.3/§9.6 must look intentional with exactly three cards — do not design a grid that visually implies a much larger catalog is missing (e.g. avoid empty placeholder card slots, avoid a "browse 50+ courses" framing that the current catalog can't support).

## 17. PRD Traceability

| Section | PRD references |
|---|---|
| Hero | CAT-001, CAT-002, §4.1, §4.4 |
| Outcome Proof | PRJ-008, PRJ-010, Executive Summary |
| What Can You Build? | CAT-001, Appendix A |
| How DirakitPro Works | §7.4 Journey B, PRJ-003 (publishing optional) |
| Signature Build Progress | BLD-001, BLD-002, BLD-003 |
| Featured Courses | CAT-001, CAT-002, COM-001 |
| Learner Project Showcase | PRJ-006, PRJ-007, PRJ-008 |
| Why DirakitPro | §4.6 Product Principles, §2.3 Opportunity |
| Learning Progression | §19.1 Product Ladder |
| Campaign / Bundle | CAT-005, COM-003, COM-004, COM-005, COM-006 |
| Social Proof | §5.3 North-star metrics (Published Project Rate framing) |
| FAQ | IAM-001/005, §4.6 (AI allowed), COM-001, PRJ-003, §6.2 (certificates P1) |
| Final CTA | §4.4 Beginner-facing promise |
| Navigation | §12.1/§12.2 routes only |
| Footer | §12.1/§12.2 routes; Legal/Privacy/Terms flagged as pending, §18.4 Public Brand Release Gate |

## 18. Stitch / Claude Design Instructions

```text
PRD (DirakitPro_MVP_PRD_V1.0.md)
+
DESIGN.md
+
HOMEPAGE.md (this document)
        ↓
Google Stitch / Claude Design
```

Whichever tool is used to generate Homepage V1 visuals in Design Session 3B, generated output must not:

- change the 13-section order (§7) without this document being revised first;
- invent additional homepage sections beyond the 13 specified;
- add navigation items or CTA destinations not backed by a PRD §12 route;
- invent testimonials, learner names, projects, or aggregate stats not explicitly marked as sample/demo content;
- replace the Connected Build Progress component (§9.5, DESIGN.md §18.1/§25.5) with a generic progress bar, percentage ring, or checklist;
- change the locked brand palette (`#E3F2FD` / `#90CAF9` / `#2196F3` / `#0D47A1`, plus `#1976D2` for accessible normal-text buttons) or introduce a second brand hue;
- imply project publication is required for course completion (§9.4 constraint);
- answer the "Berapa lama akses course?" FAQ question with an invented policy (§9.12).

This section intentionally does not include a ready-to-paste Stitch/Claude prompt string — per the governing brief, prompt generation is deferred until Design Session 3B, and if a prompt file is created then, it must be derived from this document rather than becoming a second source of truth for the homepage.

## 19. Acceptance Criteria

A generated Homepage V1 visual design is acceptable for review only if:

- All 13 sections are present in the locked order, with §10 correctly omitted when no bundle is ACTIVE.
- Every CTA and nav link resolves to a route that exists in `SCREEN_INVENTORY.md`/PRD §12 — none are placeholders pointing nowhere or to invented routes.
- The Connected Build Progress showcase (§9.5) is visually distinguishable from a generic progress bar and preserves the four Completed/Current/Upcoming/Optional states via shape, not color alone.
- No fabricated social proof (testimonials, learner counts, ratings, project counts) appears without explicit "Sample"/"Demo" labeling.
- Publishing is never implied as mandatory anywhere on the page.
- The per-section visual-direction allocation in §9/§6 is recognizable — the page should not read as uniformly one direction end-to-end, nor as three unrelated visual languages stitched together.
- Color balance roughly follows DESIGN.md §25.8 (neutral-dominant, blue as accent, brand-900 reserved for the Hero/Final CTA/Campaign strong moments) — the page must not read as painted mostly blue.
- Mobile behavior for Hero, cards, Build Progress, and Project Showcase follows §11 exactly (no side-by-side mobile hero previews, no horizontally-shrunk showcase screenshots).
- Accessibility baseline from §12 is addressed at the design level (visible focus states, non-color state indicators, adequate contrast on any brand-900 CTA background).

## 20. Design Status

```text
Homepage Product / UX Specification:  READY FOR VISUAL DESIGN
Homepage Visual Design:                NOT STARTED
Homepage Design Lock:                  NOT LOCKED
```

This document does not constitute a homepage design lock. It becomes actionable input for Design Session 3B (Homepage Visual Design in Google Stitch and/or Claude Design), after which the resulting visual output must be audited against §19's Acceptance Criteria and remediated before any "Homepage Design — LOCKED" status is claimed.
