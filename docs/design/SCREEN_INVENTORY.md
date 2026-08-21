# DirakitPro Screen Inventory

Screen planning only — no visual design in this document. Every route below is drawn directly from `DirakitPro_MVP_PRD_V1.0.md` §12 (Information Architecture & Routes). Waves indicate design priority order for Session 2 onward, not build order.

**Total: 27 PRD routes (26 UI routes + 1 non-UI webhook route)** — this matches PRD V1.0 §12 exactly: 10 public + 7 learner + 10 commerce/admin/API. This count is the product navigation contract and must not be inflated by documenting implementation-detail views as new routes.

## Terminology

To keep this document precise and prevent implementation-detail views from being mistaken for product-locked navigation, four terms are used consistently below:

- **Route** — a navigation surface defined by the LOCKED PRD (§12). Only these count toward the 27-route total.
- **Screen State** — a meaningful visual state within a route (e.g. a list view, a create form, an edit form, a detail/configuration view). Multiple screen states may exist inside one route.
- **Sub-view** — a tab, drawer, detail pane, editor, form, modal, or filter mode nested inside a route or screen state (e.g. a "Payments" filter tab inside `/admin/orders`).
- **Non-UI Surface** — a server-to-server integration endpoint with no designed screen (only `/api/payments/midtrans/webhook` in MVP).

A route may contain any number of screen states and sub-views without becoming multiple routes. Exact implementation URLs for those states (e.g. whether course editing eventually lives at a distinct address) are deferred to the later architecture/implementation session — this document specifies product-facing navigation and screen content, not URL structure.

---

## Wave 0 — Identity & Access

Not called out as its own wave in the brief, added because IAM-001/002/003/005 are P0 and every guest's first real interaction with the product (other than browsing) runs through these three screens.

### `/login`

- **Actor:** Guest
- **Purpose:** Authenticate an existing user, including Google login.
- **Primary action:** Sign in (email/password or Google)
- **Secondary action:** Go to `/register`; go to `/forgot-password`
- **Required data:** None on load; credentials on submit
- **Key components:** Auth form, Google login button, error banner, link row
- **Empty state:** N/A
- **Loading state:** Submit button loading state; Google redirect spinner
- **Error state:** Invalid credentials, unverified email, provider error — inline, specific
- **Mobile priority:** P0 — must be flawless on mobile, likely the first screen many users hit
- **PRD references:** IAM-001, IAM-002, IAM-005

### `/register`

- **Actor:** Guest
- **Purpose:** Create a new account, including Google sign-up.
- **Primary action:** Create account
- **Secondary action:** Go to `/login`
- **Required data:** Name/email/password or Google identity on submit
- **Key components:** Auth form, Google button, terms acknowledgment, error banner
- **Empty state:** N/A
- **Loading state:** Submit button loading state
- **Error state:** Email already in use, weak password, provider error
- **Mobile priority:** P0
- **PRD references:** IAM-001, IAM-005

### `/forgot-password`

- **Actor:** Guest
- **Purpose:** Initiate Clerk-backed account recovery.
- **Primary action:** Send reset link/code
- **Secondary action:** Back to `/login`
- **Required data:** Email
- **Key components:** Single-field form, confirmation message
- **Empty state:** N/A
- **Loading state:** Submit button loading state
- **Error state:** Email not found (or neutral messaging per Clerk's enumeration-safe pattern), rate-limited
- **Mobile priority:** P0
- **PRD references:** IAM-003

---

## Wave 1 — Signature Screens

Highest design priority. These four screens carry the product's core identity and are the first candidates for Stitch exploration in Session 2.

### `/` — Homepage

- **Actor:** Guest (primarily); returning Learner may also land here
- **Purpose:** Communicate the outcome-first value proposition, surface active campaigns, build trust via real learner output.
- **Primary action:** "Mulai Merakit" → into a featured course or the catalog
- **Secondary action:** Browse `/projects` (social proof), view an active bundle
- **Required data:** Featured published courses, active bundle campaigns within window, featured+approved public projects
- **Key components:** Marketing header, hero (value prop + real project visual), featured course cards, active bundle banner/card, student project showcase strip, footer
- **Empty state:** If no bundle is currently ACTIVE, the campaign section is omitted entirely (not shown as an empty placeholder) — homepage degrades gracefully to courses + showcase only
- **Loading state:** Skeleton for hero image and card grids; header/nav render immediately
- **Error state:** If featured-content fetch fails, fall back to a generic value-prop hero with a catalog CTA — homepage must never hard-fail
- **Mobile priority:** P0 — highest-traffic entry point
- **PRD references:** CAT-001, CAT-005, PRJ-006, §6.1 Marketing

### `/courses/[slug]` — Course Detail

- **Actor:** Guest, Learner
- **Purpose:** Convert a visitor into a buyer by leading with the outcome, then curriculum, then price.
- **Primary action:** "Mulai Merakit" (→ auth if needed → `/checkout/course/[slug]`)
- **Secondary action:** Preview curriculum; if already owned, "Lanjut Merakit" (→ `/learn/[courseSlug]`) instead of purchase CTA
- **Required data:** Course metadata, final-result preview, what-you'll-build/learn, curriculum outline, price, ownership status for the current user
- **Key components:** Outcome hero, curriculum accordion/list, price/CTA panel (sticky on desktop), ownership indicator, FAQ/requirements block
- **Empty state:** N/A (course must exist and be PUBLISHED to route here)
- **Loading state:** Skeleton for hero + curriculum list
- **Error state:** 404 if slug not found or course is DRAFT/UNPUBLISHED and viewer has no active enrollment
- **Mobile priority:** P0 — CTA and price must be reachable without excessive scrolling
- **PRD references:** CAT-002, CAT-003, CAT-004, CAT-006, COM-001

### `/dashboard` — Learner Dashboard

- **Actor:** Learner
- **Purpose:** Get the learner back into their in-progress build as fast as possible; surface Build Progress across all enrolled courses.
- **Primary action:** "Lanjut Merakit" on the most recent/active course
- **Secondary action:** Jump to any other enrolled course; go to `/account/orders`; go to `/projects/me`
- **Required data:** All ACTIVE/COMPLETED enrollments for the user, per-course Build Progress, current stage per course
- **Key components:** Per-course progress card (Build Progress signature component, compact form), "continue" CTA, empty-state prompt if zero enrollments
- **Empty state:** "Belum ada rakitan di sini. Mulai course pertamamu untuk mulai merakit." + catalog CTA — never a bare "no data"
- **Loading state:** Skeleton progress cards
- **Error state:** Partial-load tolerant — if one course's progress fails to load, others still render; failed card shows a retry affordance, not a full-page error
- **Mobile priority:** P0 — a returning learner's most frequent destination
- **PRD references:** LRN-001, BLD-003, COM-011

### `/learn/[courseSlug]/[lessonSlug]` — Learning Workspace

- **Actor:** Learner (enrollment required)
- **Purpose:** Deliver lesson content and the build task, and record progress, in the calmest surface in the product.
- **Primary action:** Complete lesson / confirm checkpoint → advance to next lesson
- **Secondary action:** Open curriculum navigation (sidebar/drawer); mark optional lesson as skipped
- **Required data:** Enrollment validity (server-verified), lesson content/type, task/checkpoint metadata, current lesson/stage progress state
- **Key components:** Lesson content pane, task/checkpoint block, "next action" affordance, curriculum navigation (sidebar desktop / drawer mobile), compact Build Progress indicator
- **Empty state:** N/A
- **Loading state:** Content-pane skeleton; navigation loads independently so it's usable even if content is still fetching
- **Error state:** No valid enrollment → redirect/block with a clear "you don't have access" state and a link back to the course detail/purchase page; lesson-save failure → inline retry, must not silently lose progress
- **Mobile priority:** P0 — must fully support the top-progress + content + drawer pattern from DESIGN.md §19
- **PRD references:** LRN-002, LRN-003, LRN-004, LRN-005, LRN-006, BLD-001, BLD-002, BLD-004

---

## Wave 2 — Discovery & Social Proof

### `/courses` — Course Catalog

- **Actor:** Guest, Learner
- **Purpose:** Let a visitor browse all published courses and compare outcomes.
- **Primary action:** Open a course → `/courses/[slug]`
- **Secondary action:** Filter/sort by difficulty, price, or outcome category (if included in MVP scope)
- **Required data:** All PUBLISHED courses with thumbnail, outcome, difficulty, duration estimate, price, ownership flag
- **Key components:** Course card grid, ownership indicator badge, filter/sort bar (optional for MVP)
- **Empty state:** Should not occur at launch (catalog is seeded with ≥1 course per DoD), but if it ever does: "Course baru akan segera hadir."
- **Loading state:** Skeleton card grid
- **Error state:** Retry affordance; never a blank page
- **Mobile priority:** P0
- **PRD references:** CAT-001, CAT-003, CAT-006

### `/bundles` — Bundle Catalog

- **Actor:** Guest, Learner
- **Purpose:** Let a visitor discover every currently ACTIVE bundle campaign without needing a direct link (added in PRD V1.0 remediation, CAT-005).
- **Primary action:** Open a bundle → `/bundles/[slug]`
- **Secondary action:** None
- **Required data:** All bundles with state ACTIVE and within campaign window
- **Key components:** Bundle card (type badge, price, selection rule, expiry/countdown)
- **Empty state:** "Belum ada campaign aktif saat ini." + link back to `/courses` — no dead end
- **Loading state:** Skeleton bundle cards
- **Error state:** Retry affordance
- **Mobile priority:** P1 within this wave — important but lower traffic than `/courses`
- **PRD references:** CAT-005

### `/bundles/[slug]` — Bundle Detail / Selector

- **Actor:** Guest, Learner
- **Purpose:** Explain the bundle offer and, for `CHOOSE_N`, let the learner select courses.
- **Primary action:** "Pilih course" (CHOOSE_N) or "Mulai Merakit" (FIXED) → `/checkout/bundle/[slug]`
- **Secondary action:** View included/eligible course details individually
- **Required data:** Bundle type, price, campaign window, included courses (FIXED) or eligible course pool + N (CHOOSE_N), current user's ownership status per eligible course
- **Key components:** Bundle hero (value framing, countdown), course selection grid with ownership state (owned courses disabled/marked, per COM-007), running "N of N selected" indicator, CTA panel
- **Empty state:** N/A (route requires an existing bundle)
- **Loading state:** Skeleton hero + course grid
- **Error state:** Bundle not found/expired → clear messaging, not a generic 404; "not enough eligible unowned courses" state per COM-007 shown inline, not just at checkout
- **Mobile priority:** P0 — the CHOOSE_N selection interaction specifically must work well on mobile (see Wave 3 note)
- **PRD references:** CAT-005, COM-003, COM-004, COM-005, COM-006, COM-007

### `/projects` — Curated Gallery

- **Actor:** Guest, Learner
- **Purpose:** Showcase the best learner output as social proof and acquisition loop.
- **Primary action:** Open a project → `/projects/[username]/[slug]`
- **Secondary action:** Filter by course/technology (optional for MVP)
- **Required data:** Projects where visibility=PUBLIC, moderation=APPROVED, featured=FEATURED only
- **Key components:** Project card grid (screenshot-first), empty-state prompt
- **Empty state:** Pre-launch/early-traction reality: "Karya pertama akan segera tampil di sini." — must be designed for since MVP gallery may legitimately be empty at day one
- **Loading state:** Skeleton project card grid
- **Error state:** Retry affordance
- **Mobile priority:** P0
- **PRD references:** PRJ-006, PRJ-007

### `/projects/[username]/[slug]` — Public Project Showcase

- **Actor:** Guest, Learner
- **Purpose:** Present one learner's finished output as a shareable, professional-looking result.
- **Primary action:** Visit live URL
- **Secondary action:** Copy link / share (LinkedIn/generic)
- **Required data:** Project title, author display name, screenshot, description, feature list, technology list, live URL, repo URL (optional), OG metadata
- **Key components:** Project Result signature component (DESIGN.md §18.2), share controls
- **Empty state:** N/A
- **Loading state:** Skeleton hero screenshot + text blocks
- **Error state:** Project HIDDEN/REJECTED or not found → standard not-found treatment (never reveal moderation reason to the public); PUBLIC+UNREVIEWED renders normally but with `noindex`
- **Mobile priority:** P0 — this is the page most likely to be opened from an external share link on mobile
- **PRD references:** PRJ-003, PRJ-004, PRJ-005, PRJ-007, PRJ-008, PRJ-009, PRJ-010

---

## Wave 3 — Commerce

### `/checkout/course/[courseSlug]` — Direct Course Checkout

- **Actor:** Learner (auth required)
- **Purpose:** Confirm the purchase and hand off to Midtrans.
- **Primary action:** Pay (→ Midtrans Snap)
- **Secondary action:** Back to course detail
- **Required data:** Course title/price snapshot, existing-order/ownership checks (COM-015/COM-016)
- **Key components:** Order summary card, price breakdown, pay button, security/trust microcopy
- **Empty state:** N/A
- **Loading state:** Order-creation loading state on the pay button; Midtrans Snap overlay loading
- **Error state:** Already-owned block (COM-016) shown before payment attempt; existing-PENDING-order reuse (COM-015) shown transparently ("Kamu punya transaksi yang belum selesai untuk course ini") rather than silently creating a duplicate
- **Mobile priority:** P0 — payment must work flawlessly on mobile
- **PRD references:** COM-001, COM-002, COM-009, COM-010, COM-015, COM-016

### `/checkout/bundle/[bundleSlug]` — Bundle Checkout

- **Actor:** Learner (auth required)
- **Purpose:** Confirm the immutable course selection/grant and hand off to Midtrans.
- **Primary action:** Pay (→ Midtrans Snap)
- **Secondary action:** Back to bundle detail to change selection (CHOOSE_N, only before order creation)
- **Required data:** Bundle price snapshot, exact granted-course list (FIXED) or confirmed N-course selection (CHOOSE_N), existing-order checks
- **Key components:** Order summary listing every course to be granted, price, pay button
- **Special attention — CHOOSE_N Bundle Selection:** the selection step (e.g. "Paket Merdeka — pilih 2 course") must make the running count ("1/2 dipilih"), ineligible/owned course disabling, and the exact-N validation (COM-005) visually unambiguous *before* the learner reaches this checkout summary — by this screen, selection is already locked and shown read-only.
- **Empty state:** N/A
- **Loading state:** Same pattern as direct checkout
- **Error state:** Selection count mismatch caught upstream at the selector, not here; bundle-expired-before-payment does not error here — order remains payable per COM-006
- **Mobile priority:** P0
- **PRD references:** COM-003, COM-004, COM-005, COM-006, COM-007, COM-008, COM-015

### `/payment/[orderId]` — Payment Status/Result

- **Actor:** Learner
- **Purpose:** Show the current (non-authoritative-but-informative) payment status while the webhook settles authoritatively in the background.
- **Primary action:** Once PAID: "Mulai Merakit"/"Lanjut Merakit" into the newly granted course(s)
- **Secondary action:** Retry payment (if FAILED/EXPIRED); view order in `/account/orders`
- **Required data:** Order status (poll or webhook-driven update), granted course list once available
- **Key components:** Status banner (pending/success/failed), granted-course summary list (bundle: all N courses), CTA appropriate to state
- **Empty state:** N/A
- **Loading state:** "Menunggu konfirmasi pembayaran…" pending state — must not claim success before the webhook confirms
- **Error state:** FAILED/EXPIRED shown plainly with a retry path; must never claim enrollment is active before COM-010's authoritative webhook has actually granted it
- **Mobile priority:** P0 — the redirect-back-from-Midtrans landing page, almost always mobile
- **PRD references:** COM-009, COM-010, COM-011, NTF-003

---

## Wave 4 — Learner Management

### `/learn/[courseSlug]` — Course Start/Overview

- **Actor:** Learner (enrollment required)
- **Purpose:** Orient the learner before diving into the first/next lesson; show overall Build Progress for this course.
- **Primary action:** "Lanjut Merakit" → next incomplete lesson
- **Secondary action:** Jump to any specific stage/lesson from an overview list
- **Required data:** Full course structure, per-lesson/milestone completion state for this learner
- **Key components:** Course-level Build Progress (full, non-compact version), stage/lesson overview list
- **Empty state:** N/A
- **Loading state:** Skeleton progress + list
- **Error state:** No enrollment → same access-block treatment as the lesson workspace
- **Mobile priority:** P0
- **PRD references:** LRN-001, LRN-006, BLD-003, BLD-004

### `/projects/me` — Learner Projects

- **Actor:** Learner
- **Purpose:** Let the learner see and manage every project tied to their enrollments.
- **Primary action:** Open a project → `/projects/me/[projectId]`
- **Secondary action:** None
- **Required data:** All Projects owned by the learner (one per Enrollment, per PRJ-001), with course title, visibility, moderation state
- **Key components:** Project list/card grid with status badges
- **Empty state:** "Belum ada rakitan di sini." + link to active course — occurs for a brand-new learner before their first Enrollment activates a Project
- **Loading state:** Skeleton list
- **Error state:** Retry affordance
- **Mobile priority:** P1
- **PRD references:** PRJ-001, PRJ-003, PRJ-005

### `/projects/me/[projectId]` — Edit/Submit/Publish Project

- **Actor:** Learner (owner only, server-verified)
- **Purpose:** Submit the final build (live URL, repo, screenshot, notes) and control visibility.
- **Primary action:** Submit (DRAFT → SUBMITTED); Publish (set visibility PUBLIC)
- **Secondary action:** Edit submission fields after SUBMITTED; set visibility back to PRIVATE
- **Required data:** Current submission fields, current visibility/moderation state, course context
- **Key components:** Submission form (live URL with format validation, repo URL, screenshot upload, notes), visibility toggle with a plain-language explanation of what PUBLIC means (direct link is live immediately, gallery requires approval), moderation-state indicator if already public
- **Empty state:** Pre-submission, form is simply empty with encouraging placeholder guidance, not an "empty state" per se
- **Loading state:** Upload progress for screenshot; submit button loading state
- **Error state:** Invalid URL format (PRJ-002), upload validation failure (file type/size), submission blocked if required build milestones aren't complete yet (surfaced clearly, not just a disabled button with no explanation)
- **Mobile priority:** P0 — this is the moment of course completion, must not be a desktop-only form
- **PRD references:** PRJ-001, PRJ-002, PRJ-003, PRJ-004, §16 (ownership authorization)

### `/account` — Account

- **Actor:** Learner
- **Purpose:** Basic account information and settings entry point.
- **Primary action:** Edit profile display name/avatar (if in MVP scope); manage auth via Clerk-hosted flows
- **Secondary action:** Go to `/account/orders`
- **Required data:** Internal User profile fields
- **Key components:** Profile summary, settings links
- **Empty state:** N/A
- **Loading state:** Skeleton profile block
- **Error state:** Save failure inline
- **Mobile priority:** P1
- **PRD references:** IAM-001, IAM-004

### `/account/orders` — Order History

- **Actor:** Learner
- **Purpose:** Let the learner review every direct-course and bundle purchase, its status, and the course(s) it granted.
- **Primary action:** Open an order for detail (if a detail view is needed) or jump directly to a granted course
- **Secondary action:** Retry a FAILED/EXPIRED order
- **Required data:** All Orders for this user, purchase type (DIRECT_COURSE/BUNDLE), amount, status, granted course(s) per order
- **Key components:** Order list/table, status badges, per-order granted-course chips (bundle orders show all N)
- **Empty state:** "Belum ada transaksi." + catalog CTA
- **Loading state:** Skeleton list
- **Error state:** Retry affordance
- **Mobile priority:** P0 — a table-like view that must still work on a small screen (card-per-order pattern rather than a wide table)
- **PRD references:** COM-012, COM-013

---

## Wave 5 — Admin

All admin screens share one authorization requirement (ADM-001) and one navigation shell (persistent sidebar per DESIGN.md §17); it is not repeated in every entry's Key Components for brevity, but every admin screen requires it.

### `/admin` — Admin Dashboard

- **Actor:** Admin
- **Purpose:** At-a-glance operational overview.
- **Primary action:** Navigate to a specific management area
- **Secondary action:** None
- **Required data:** Summary KPIs (revenue split direct/bundle, active enrollments, completion rate, Published Project Rate, moderation queue size)
- **Key components:** KPI summary tiles, recent-activity list, moderation-queue shortcut
- **Empty state:** Pre-launch state with zeroed KPIs, not broken widgets
- **Loading state:** Skeleton KPI tiles
- **Error state:** Per-widget retry, not full-page failure
- **Mobile priority:** P2 — admin is expected primarily on desktop, but must not be unusable on tablet
- **PRD references:** ADM-001, §13.4

### `/admin/courses` — Course/Curriculum/Pricing Management

- **Actor:** Admin
- **Purpose:** See and manage all courses regardless of publish state, including curriculum and pricing.
- **Primary Screen State:** Course list — table of all courses with status, price, enrollment count
- **Additional States / Sub-views:**
  - *Create course* — metadata form (title, outcome, difficulty, duration)
  - *Edit course* — same metadata form, pre-filled, plus publish/unpublish control
  - *Course detail/configuration* — pricing field (with COM-001 price>0-if-paid validation surfaced here), curriculum tree editor (stage/lesson reordering, not necessarily drag-and-drop per ADM-003), build milestone manager
  - *Curriculum management entry* — the stage/lesson/milestone editor reached from within a course's configuration view
  - These are screen states/sub-views within the single `/admin/courses` route, not independent PRD routes. *(A possible future implementation route such as a per-course edit URL is an implementation detail — NOT product-locked; that decision is deferred to the architecture session.)*
- **Primary action:** Create course; open a course into its configuration view
- **Secondary action:** Publish/unpublish inline from the list; add/reorder stage, lesson, or build milestone within configuration
- **Required data:** All courses with status, price, enrollment count (list); full course + curriculum tree (configuration state)
- **Key components:** Course table/list, status badges, quick actions, metadata form, curriculum tree editor, milestone manager
- **Empty state:** List: "Belum ada course. Buat course pertama." + create CTA. Configuration: new course starts with an empty curriculum tree + "add first stage" prompt.
- **Loading state:** Skeleton table (list); skeleton form + tree (configuration)
- **Error state:** Retry affordance (list); validation errors inline in configuration (e.g. attempting to publish a paid course with no price); unpublish-with-existing-learners shown as an informational confirmation, not a silent action, given CAT-003's access-continuity rule
- **Mobile priority:** P2 — content authoring is a desktop-primary task for MVP
- **PRD references:** ADM-002, ADM-003, CAT-003, COM-001, LRN-003, BLD-001

### `/admin/bundles` — Bundle Campaign Management

- **Actor:** Admin
- **Purpose:** See and manage all bundle campaigns — type, price, eligible courses, and campaign window.
- **Primary Screen State:** Bundle list — table of all bundles with type, state, campaign window, price
- **Additional States / Sub-views:**
  - *Create bundle* — bundle metadata form (type, price, campaign window)
  - *Edit bundle* — same metadata form, pre-filled, plus activate/deactivate control
  - *Bundle detail* — course-eligibility picker, campaign window date picker, live preview of the guest-facing bundle card
  - *FIXED configuration* — fixed included-course list picker
  - *CHOOSE_N configuration* — eligible course pool picker + N value field
  - *Campaign window* and *Eligible courses* — fields/sections within bundle detail, not separate screens
  - These are screen states/sub-views within the single `/admin/bundles` route, not independent PRD routes. *(A possible future implementation route such as a per-bundle edit URL is an implementation detail — NOT product-locked.)*
- **Primary action:** Create bundle; open a bundle into its detail/configuration view
- **Secondary action:** Activate/deactivate inline from the list; change bundle type within configuration (with a clear warning if changing type after courses/orders exist against it — historical orders remain unaffected per COM-008)
- **Required data:** All bundles with type, state, campaign window, price (list); bundle fields, eligible course pool or fixed course list, N value, `starts_at`/`ends_at` (detail)
- **Key components:** Bundle table/list, state badges, quick actions, bundle metadata form, course-eligibility picker, campaign window date picker, bundle card live preview
- **Empty state:** List: "Belum ada campaign bundle." + create CTA. Detail: new bundle starts with no courses attached + prompt to add.
- **Loading state:** Skeleton table (list); skeleton form (detail)
- **Error state:** Retry affordance (list); N greater than eligible pool size, missing price, invalid window (end before start) — validated inline (detail)
- **Mobile priority:** P2
- **PRD references:** ADM-004, COM-003, COM-004, COM-005, COM-006, COM-007

### `/admin/users` — Learner View

- **Actor:** Admin
- **Purpose:** See learners and their basic enrollment info.
- **Primary action:** Search/filter learners; open a learner's detail (if included)
- **Secondary action:** None (read-mostly per ADM-005)
- **Required data:** User list with enrollment counts, join date
- **Key components:** User table/list, search
- **Empty state:** Not expected post-launch; pre-launch shows an empty table with no special messaging needed
- **Loading state:** Skeleton table
- **Error state:** Retry affordance
- **Mobile priority:** P2
- **PRD references:** ADM-005

### `/admin/orders` — Orders/Payments

- **Actor:** Admin
- **Purpose:** Review commerce activity — orders and their payment states. PRD §12.3 defines this as one combined route covering both orders and payments; there is no separate `/admin/payments` route.
- **Primary Screen State:** Orders View — table of all orders with type, amount, status, granted courses
- **Additional States / Sub-views:**
  - *Payments View* — a filter/tab within this same route surfacing payment-level detail (provider status, raw payload reference) and payment investigation for a given order
  - *Order/payment detail pane* — drill-in from either view
  - These are screen states/sub-views within the single `/admin/orders` route, not a second PRD route.
- **Primary action:** Filter/search orders; drill into an order's payment detail
- **Secondary action:** Mark refunded (manual, per COM-013); export (if in scope)
- **Required data:** All orders with type, amount, status, associated payment state, granted courses
- **Key components:** Order table/list with status filter, Payments view/tab, detail panel
- **Empty state:** Pre-launch empty table
- **Loading state:** Skeleton table
- **Error state:** Retry affordance
- **Mobile priority:** P2
- **PRD references:** ADM-006, COM-012, COM-013

### `/admin/projects` — Project Moderation & Featured Management

- **Actor:** Admin
- **Purpose:** Moderate public submissions and curate the gallery.
- **Primary action:** Approve / Reject / Hide a project; toggle Featured
- **Secondary action:** View moderation reason history; open the public showcase for reference
- **Required data:** All projects with visibility, moderation state, featured flag, submission content
- **Key components:** Moderation queue (prioritizing UNREVIEWED), action buttons with a required reason field for Reject/Hide, Featured toggle restricted to APPROVED+PUBLIC items
- **Empty state:** "Tidak ada project yang perlu direview." — genuinely positive empty state for the queue
- **Loading state:** Skeleton queue list
- **Error state:** Retry affordance; action failure keeps the item in-queue rather than silently dropping it
- **Mobile priority:** P2
- **PRD references:** ADM-007, PRJ-005, PRJ-006

---

## Non-UI Surface

### `/api/payments/midtrans/webhook`

- **Actor:** Midtrans (server-to-server)
- **Purpose:** Authoritative payment state source; not a designed screen.
- **PRD references:** COM-010, COM-011, 16 (webhook signature verification)

Included here only for completeness against the PRD's full route table — no design artifact is produced for this surface.

---

## Summary

```text
PRD Routes by wave (UI routes only):
Wave 0 — Identity & Access:            3 routes
Wave 1 — Signature Screens:            4 routes
Wave 2 — Discovery & Social Proof:     5 routes
Wave 3 — Commerce:                     3 routes
Wave 4 — Learner Management:           5 routes
Wave 5 — Admin:                        6 routes  (/admin, /admin/courses,
                                        /admin/bundles, /admin/users,
                                        /admin/orders, /admin/projects)

UI routes subtotal:                    26
Non-UI routes (webhook):               1  (/api/payments/midtrans/webhook)
--------------------------------------------
Total PRD routes:                      27  (matches PRD V1.0 §12 exactly:
                                        10 public + 7 learner +
                                        10 commerce/admin/API)

Additional design states/sub-views documented above (course create/edit/
configuration within /admin/courses; bundle create/edit/detail/FIXED/
CHOOSE_N configuration within /admin/bundles; Orders View/Payments View
within /admin/orders) are NOT counted as PRD routes — they are screen
states and sub-views inside the routes listed above, per the
Route / Screen State / Sub-view distinction defined at the top of this
document.
```
