# DirakitPro — MVP Product Requirements Document

Website pembelajaran untuk pemula di Indonesia yang berorientasi pada hasil nyata: learner belajar sambil **merakit**, menerbitkan, dan menunjukkan project yang benar-benar jadi.

> **Brand philosophy**
>
> **Profesional itu dirakit.** DirakitPro percaya bahwa produk, kemampuan, pengalaman, portfolio, dan karier tidak menjadi profesional secara instan. Semuanya dibangun bagian demi bagian, diuji, dipahami, diperbaiki, dan dibuktikan melalui hasil nyata.

> **Product thesis**
>
> Pemula tidak membeli teori. Mereka lebih mudah membeli hasil yang dapat dilihat. Karena itu pengalaman utama DirakitPro bukan “menonton course”, melainkan **merakit sesuatu sampai jadi**, lalu menaikkan standar setiap rakitan seiring kemampuan learner berkembang.

| Field | Value |
|---|---|
| Document | Product Requirements Document |
| Product | **DirakitPro** |
| Version | **V1.3** |
| Status | **LOCKED** (amended) |
| Lock date | 21 August 2026 |
| Last scope amendment | 24 August 2026 — formalized lesson content-block types, removed `videoProviderId`, added course-level resources; see [Appendix G](#appendix-g--v12--v13-product-scope-change-log) (previous: [Appendix F](#appendix-f--v11--v12-product-scope-change-log)) |
| Market | Indonesia |
| Primary segment | Beginner digital builders, terutama usia 18–27 tahun |
| Brand philosophy | **Profesional itu dirakit.** |
| Product architecture | Next.js full-stack modular monolith |
| Authentication decision | Clerk + internal application user table |
| Canonical format | Repository Markdown (`PRD.md`) |
| Supersedes | `DirakitPro_MVP_PRD_V0.3.md` (Product Lock Candidate, preserved for history) |

> **Product Scope Change policy**
>
> After the V1.0 lock, any change to P0 scope requires an explicit Product Scope Change decision, logged as a new appendix entry rather than a silent edit. V1.1 applies this policy for the first time — see Appendix E. This document remains the implementation baseline for engineering.

## Daftar Isi

1. [Executive Summary](#1-executive-summary)
2. [Product Context & Problem](#2-product-context--problem)
3. [Target Market & Personas](#3-target-market--personas)
4. [Product Positioning, Brand & Principles](#4-product-positioning-brand--principles)
5. [Goals, Non-Goals & Success Metrics](#5-goals-non-goals--success-metrics)
6. [MVP Scope & Priorities](#6-mvp-scope--priorities)
7. [User Roles & Core Journeys](#7-user-roles--core-journeys)
8. [Functional Requirements](#8-functional-requirements)
9. [Learning & Content Model](#9-learning--content-model)
10. [Business Rules & State Models](#10-business-rules--state-models)
11. [Data & Domain Model](#11-data--domain-model)
12. [Information Architecture & Routes](#12-information-architecture--routes)
13. [Analytics & KPI Instrumentation](#13-analytics--kpi-instrumentation)
14. [Technical Architecture & Stack](#14-technical-architecture--stack)
15. [Non-Functional Requirements](#15-non-functional-requirements)
16. [Security Baseline](#16-security-baseline)
17. [Testing & Release Gates](#17-testing--release-gates)
18. [Risks, Assumptions & Product Lock Decisions](#18-risks-assumptions--product-lock-decisions)
19. [Post-MVP Roadmap](#19-post-mvp-roadmap)
20. [MVP Definition of Done](#20-mvp-definition-of-done)
21. [Appendix A — Initial MVP Course Lineup](#appendix-a--initial-mvp-course-lineup)
22. [Appendix B — V0.1 → V0.2 Decision Log](#appendix-b--v01--v02-decision-log)
23. [Appendix C — V0.2 → V0.3 Decision Log](#appendix-c--v02--v03-decision-log)
24. [Appendix D — V0.3 → V1.0 Implementation Readiness Remediation Log](#appendix-d--v03--v10-implementation-readiness-remediation-log)
25. [Appendix E — V1.0 → V1.1 Product Scope Change Log](#appendix-e--v10--v11-product-scope-change-log)
26. [Appendix F — V1.1 → V1.2 Product Scope Change Log](#appendix-f--v11--v12-product-scope-change-log)
27. [Appendix G — V1.2 → V1.3 Product Scope Change Log](#appendix-g--v12--v13-product-scope-change-log)

## 1. Executive Summary

DirakitPro adalah platform pembelajaran online untuk pemula di Indonesia yang mengubah pusat pengalaman belajar dari “content consumption” menjadi “visible outcome”. Learner membeli kelas karena ingin menghasilkan sesuatu yang dapat dilihat, digunakan, dibagikan, dan dimasukkan ke portfolio — bukan hanya karena ingin menyelesaikan playlist video.

MVP berfokus pada alur: Course discovery → Purchase → Build-oriented learning → Progress → Project submission → Live/public showcase. **Course adalah unit jual utama**: satu pembelian course memberikan akses ke seluruh isi course tersebut. Admin juga dapat membuat **promotional bundle** di atas beberapa course, termasuk fixed bundle dan choose-N bundle untuk campaign seperti “Paket Merdeka — pilih 2 course”. Course disusun sebagai rangkaian stage, lesson, build task, checkpoint, dan deployment milestone. Progress utama yang ditonjolkan kepada learner adalah Build Progress, bukan sekadar persentase video yang ditonton.

> **MVP value proposition**
>
> “Mulai dari rakitan pertama.” Learner menyelesaikan kelas dengan project yang benar-benar jadi, memiliki URL/hasil yang dapat ditunjukkan, dan halaman showcase yang dapat dibagikan. Setiap rakitan menjadi satu langkah menuju standar yang lebih profesional.

Secara teknis, MVP menggunakan Next.js full-stack modular monolith agar delivery cepat dan biaya operasional rendah. Authentication menggunakan Clerk sebagai identity provider, tetapi semua domain LMS mengacu pada internal User ID di PostgreSQL agar domain tidak terikat langsung pada provider authentication.

## 2. Product Context & Problem

### 2.1 Market observation

Kategori LMS dan online course di Indonesia sangat kompetitif. Untuk pemula, diferensiasi “materi lengkap”, “sertifikat”, atau “project-based learning” saja tidak cukup kuat. Banyak customer pemula lebih mudah memahami dan membeli manfaat yang konkret: memiliki website, aplikasi, dashboard, atau produk digital yang benar-benar terlihat.

### 2.2 Core problem

Banyak pemula memiliki motivasi untuk “bisa bikin sesuatu”, tetapi pengalaman belajar tradisional sering memaksa mereka melewati terlalu banyak teori sebelum memperoleh reward visual. Akibatnya learner mudah kehilangan momentum, tidak menyelesaikan course, atau selesai menonton tanpa memiliki output yang layak ditunjukkan.

### 2.3 Opportunity

- Menjual outcome yang konkret daripada syllabus yang abstrak.

- Menggunakan project sebagai pusat pengalaman belajar, bukan sebagai tugas tambahan di akhir course.

- Membuat progress terasa seperti produk learner semakin jadi.

- Mengubah hasil learner menjadi acquisition loop melalui public showcase dan shareable project card.

- Membuka jalur upsell dari beginner “Build” menuju kelas lebih advanced: Understand → Engineer → Production → Scale.

## 3. Target Market & Personas

### 3.1 Primary market

Wilayah MVP: Indonesia. Bahasa produk utama: Bahasa Indonesia, dengan istilah teknis bahasa Inggris ketika lebih natural untuk developer/product context.

### 3.2 Primary ICP

> **Primary ICP**
>
> Pemula usia kira-kira 18–27 tahun yang tertarik teknologi/AI dan ingin memiliki website atau aplikasi pertama yang dapat dipamerkan, tanpa harus sudah menjadi programmer.

- Mahasiswa yang ingin punya project nyata untuk portfolio.

- Fresh graduate yang ingin menambah bukti kemampuan sebelum melamar pekerjaan.

- Non-IT beginner/career explorer yang ingin mencoba membuat digital product.

- Calon freelancer yang ingin memiliki contoh hasil kerja.

- Junior sangat awal yang masih membutuhkan learning path berorientasi hasil.

### 3.3 Core jobs-to-be-done

| **JTBD**                                             | **Desired outcome**                                          |
|------------------------------------------------------|--------------------------------------------------------------|
| “Saya ingin bisa bikin aplikasi.”                    | Memiliki project yang berfungsi dan terlihat profesional.    |
| “Saya ingin punya sesuatu untuk dipamerkan.”         | Public project page, screenshot, live URL, share link.       |
| “Saya takut coding terlalu sulit.”                   | Mendapat reward visual sejak awal dan guidance step-by-step. |
| “Saya ingin mencoba dunia tech/AI.”                  | Menyelesaikan build pertama tanpa prerequisite berat.        |
| “Saya ingin tahu apa yang sebenarnya saya pelajari.” | Konsep dijelaskan tepat saat dibutuhkan oleh build.          |

### 3.4 Anti-persona MVP

- Senior engineer yang mencari deep system design atau production engineering.

- Enterprise L&D/corporate LMS buyer.

- Instructor marketplace yang ingin menjual course sendiri.

- Learner yang mencari live bootcamp intensif dengan career placement guarantee.

## 4. Product Positioning, Brand & Principles

### 4.1 Positioning

Kategori yang digunakan secara internal tetap **Outcome-First Learning Platform / Product-Based Learning**. Di depan customer, kata “LMS” bukan positioning utama. DirakitPro diposisikan sebagai tempat pemula **merakit sesuatu sampai jadi sambil belajar**, lalu meningkatkan kualitas rakitannya seiring kemampuan berkembang.

**Positioning statement:**

> DirakitPro adalah platform belajar berbasis karya, tempat pemula belajar dengan merakit sesuatu hingga menjadi hasil yang dapat dilihat, digunakan, dan ditunjukkan.

### 4.2 Brand meaning

Nama **DirakitPro** memiliki dua komponen makna:

- **Dirakit** — sesuatu yang baik tidak muncul sekaligus. Ia disusun bagian demi bagian melalui praktik, percobaan, kegagalan, pemahaman, dan perbaikan.
- **Pro** — bukan syarat untuk memulai. Pro adalah arah perkembangan learner.

`PRO` digunakan sebagai internal brand framework:

| Dimension | Meaning |
|---|---|
| **Professional** | Learner perlahan diperkenalkan pada standar kerja dan kualitas yang lebih baik. |
| **Progress** | Setiap rakitan adalah kemajuan; dari hasil pertama menuju sistem yang lebih matang. |
| **Proven** | Kemampuan tidak hanya diklaim, tetapi memiliki evidence melalui project, URL, source code, review, atau assessment. |

Makna inti brand:

> **DirakitPro adalah tempat orang merakit karya, kemampuan, dan pengalaman hingga semakin mendekati standar profesional.**

### 4.3 Brand philosophy

**Primary philosophy:**

> **Profesional itu dirakit.**

Implikasinya:

- Produk dirakit.
- Kemampuan dirakit.
- Pengalaman dirakit.
- Portfolio dirakit.
- Karier juga dirakit.

DirakitPro tidak menjanjikan bahwa beginner otomatis menjadi profesional setelah satu kelas. Brand justru menormalisasi perjalanan: **mulai dulu, pahami, perbaiki, naikkan standar, dan buktikan hasilnya.**

### 4.4 Beginner-facing promise

Untuk MVP, pesan utama harus tetap sederhana dan mudah dibeli pemula.

- **Brand philosophy:** “Profesional itu dirakit.”
- **Beginner promise:** “Mulai dari rakitan pertama.”
- **Supporting message:** “Belajar dengan membuat sesuatu yang nyata, lalu tingkatkan kualitasnya seiring kemampuanmu berkembang.”
- **Alternative campaign line:** “Belum pro? Memang bukan itu syaratnya. Semua profesional pernah punya rakitan pertama.”

### 4.5 Product vocabulary

Brand language digunakan untuk memberi karakter tanpa mengorbankan clarity. Istilah standar seperti `Course`, `Project`, `Payment`, atau `Account` tetap boleh digunakan ketika lebih jelas bagi user.

| Generic LMS language | Preferred DirakitPro language | Usage |
|---|---|---|
| Start Course | **Mulai Merakit** | Primary CTA setelah learner memilih course/project. |
| Continue Course | **Lanjut Merakit** | Dashboard/workspace CTA. |
| Course Progress | **Progress Rakitan** / Build Progress | Progress utama learner. |
| Final Project | **Hasil Rakitan** | Outcome akhir course. |
| Project Showcase | **Tunjukkan Karyamu** | Publication/share action. |
| Course Completed | **Rakitanmu jadi!** | Completion celebration. |
| Student Projects | **Hasil Rakitan** / Karya Learner | Social proof section. |

**Rule:** jangan memaksakan vocabulary brand jika membuat flow lebih membingungkan. Brand language terutama digunakan pada headline, CTA, progress, completion, dan showcase.

### 4.6 Product principles

| Principle | Implication |
|---|---|
| Outcome before theory | Setiap stage dimulai dari hasil yang akan dirakit, lalu konsep diperkenalkan saat dibutuhkan. |
| Build progress > watch progress | Dashboard dan workspace menonjolkan milestone produk learner. |
| Short explanation, immediate action | Video/teori singkat; mayoritas waktu digunakan untuk membangun. |
| AI is allowed | AI diperlakukan sebagai tool kerja; learner tetap harus memahami dan memvalidasi hasil. |
| Shareable by default | Setiap completion diarahkan ke project page/shareable evidence. |
| Start simple, raise the standard | Beginner boleh mulai dari “jadi dulu”, lalu course berikutnya meningkatkan pemahaman dan kualitas engineering. |
| MVP simplicity | Tidak membangun microservices, forum, mentor marketplace, atau AI evaluator sebelum validasi. |

### 4.7 Long-term learning philosophy

DirakitPro harus dapat membawa learner dari hasil pertama menuju standar profesional tanpa mengganti identitas produk.

```text
RAKITAN PERTAMA
      ↓
JADI DULU
      ↓
PAHAMI
      ↓
PERBAIKI
      ↓
ENGINEER
      ↓
PRODUCTION
      ↓
PROFESSIONAL
```

Dengan demikian, beginner dan advanced learning bukan dua produk yang bertentangan. Keduanya adalah tahapan berbeda dalam perjalanan **menaikkan standar rakitan**.

## 5. Goals, Non-Goals & Success Metrics

### 5.1 MVP goals

**1.** Membuktikan bahwa pemula bersedia membeli course karena outcome project yang konkret.

**2.** Membuktikan bahwa build-oriented experience meningkatkan aktivitas dan completion dibanding sekadar konsumsi konten.

**3.** Menghasilkan user-generated project showcase yang dapat menjadi social proof dan acquisition loop.

**4.** Membangun fondasi teknis yang cukup rapi untuk menambah kelas dan fitur advanced tanpa over-engineering.

### 5.2 Non-goals

- Menjadi marketplace course.

- Menjadi corporate LMS.

- Menjadi platform bootcamp live atau mentor marketplace (multi-mentor, discovery/booking engine pihak ketiga). *Ini berbeda dari MTR-001 (8.9) — CTA mentoring privat founder-led yang statis dan tidak melibatkan booking engine atau multiple mentor.*

- Membangun in-app booking/scheduling engine atau payment flow untuk mentoring pada MVP. Scheduling dan pembayaran mentoring privat ditangani manual di luar sistem sampai ada evidence demand yang jelas (lihat Mentoring Interest Rate, 5.3).

- Melakukan automated code review atau production-readiness assessment pada MVP.

- Mendukung mobile native app.

- Menjamin pekerjaan atau placement.

### 5.3 North-star & supporting metrics

| **Metric**             | **Definition**                                          | **MVP intent**                 |
|------------------------|-----------------------------------------------------------|--------------------------------|
| Published Project Rate | % pembeli course yang mempublikasikan project showcase. | Primary discovery metric       |
| Purchase Conversion    | % course viewers yang menjadi paid enrollment.          | Validate commercial demand     |
| Course Start Rate      | % buyer yang memulai lesson pertama.                    | Detect post-purchase friction  |
| 50% Build Reach        | % learner yang mencapai minimal 50% build milestones.   | Measure engagement             |
| Course Completion Rate | % enrollment yang menyelesaikan course.                 | Measure learning completion    |
| Share Rate             | % published project yang memicu share action.           | Measure organic loop potential |
| Mentoring Interest Rate | % unique visitor yang klik mentoring CTA (MTR-001).    | Evidence gate untuk keputusan membangun in-app booking/payment mentoring di P1 — lihat 5.2 dan Appendix E. |

## 6. MVP Scope & Priorities

### 6.1 P0 — Must ship

| **Domain** | **P0 capabilities**                                                   |
|------------|-----------------------------------------------------------------------|
| Marketing  | Homepage, value proposition, featured courses, student projects, CTA. |
| Mentoring  | Static mentoring privat section (MTR-001): description, indicative pricing, CTA ke external scheduling link. Tidak ada booking engine atau payment domain internal. |
| Catalog    | Course catalog/detail, outcome preview, pricing, active bundle campaign catalog. |
| Identity   | Register, login, logout, Google login, email verification/reset, protected routes. |
| Commerce   | Direct course purchase, fixed/choose-N bundles, checkout, order/payment, enrollment activation, duplicate-order and already-owned-course prevention. |
| Payment    | Midtrans Snap, server-side transaction creation, webhook handling.    |
| Learning   | Dashboard, stage/module, lesson types, course workspace, progress.    |
| Build      | Build tasks, checkpoints, build milestones, build progress.           |
| Project    | Submission, public/private showcase, moderation, curated gallery, share link. |
| Admin      | Course/curriculum, pricing, bundle campaign, learners, orders/payments, project moderation. |
| Email      | Transactional emails for identity, payment, enrollment, completion.   |
| Analytics  | Core funnel/product events.                                           |

### 6.2 P1 — After initial validation

- Coupon/promo codes beyond bundle campaigns.

- Course reviews/testimonials.

- Certificate generation.

- Human project review / mentor feedback (async, in-course — distinct from MTR-001's external mentoring CTA).

- In-app booking/scheduling + payment engine for mentoring privat, upgrading MTR-001 from external CTA to a built-in flow. **Gated on evidence**: only scoped in once Mentoring Interest Rate (5.3) shows sustained demand, not built speculatively.

- Referral program.

- AI learning assistant.

### 6.3 P2 / Explicitly out of MVP

- AI code evaluator / automated code grading.

- Live class infrastructure.

- Forum/community engine.

- Mentor marketplace.

- Subscription billing.

- Complex gamification, points, coin, leaderboard.

- Corporate organization accounts.

- Mobile native apps.

- Microservices, Kafka, Kubernetes.

## 7. User Roles & Core Journeys

### 7.1 Roles

| **Role** | **Capabilities**                                                                            |
|----------|-----------------------------------------------------------------------------------------------|
| Guest    | Browse courses/bundles, view public projects, register/login, start checkout.                 |
| Learner  | Purchase courses/bundles, learn, complete builds, submit/publish projects, view orders/account. |
| Admin    | Manage course/content/pricing/bundles, learners, orders/payments, project moderation/featured. |

### 7.2 Journey A — Direct course purchase to first lesson

**1.** Guest opens course detail.

**2.** Guest memilih CTA **“Mulai Merakit”**.

**3.** Authentication is requested if needed; Google login atau email/password tersedia.

**4.** System validates the learner does not already hold an ACTIVE/COMPLETED Enrollment for this course, and that no other PENDING order for the same course by the same user is open (see COM-015/COM-016). System creates Order with immutable course/price snapshot.

**5.** Server creates Midtrans transaction.

**6.** User completes payment.

**7.** Webhook confirms authoritative payment state.

**8.** System marks order paid and activates exactly one Enrollment for the purchased course.

**9.** Learner mendapat akses ke **seluruh content course** dan lands on course workspace/start page.

### 7.3 Journey A2 — Promotional bundle purchase

**1.** Guest opens an ACTIVE bundle campaign (discoverable via the `/bundles` catalog or homepage, or directly via `/bundles/[slug]`).

**2.** For `FIXED`, course contents are predetermined. For `CHOOSE_N`, guest selects exactly N eligible courses that are not already owned.

**3.** System validates bundle availability, campaign window, selection count, and course eligibility.

**4.** Authentication is requested if needed.

**5.** System creates Order with immutable bundle snapshot and the exact courses that will be granted after payment. Once this Order is created while the bundle is ACTIVE and within its campaign window, the Order remains payable until its own order/payment expiry even if the bundle later becomes INACTIVE/EXPIRED (see COM-006 addendum).

**6.** User completes payment through Midtrans.

**7.** Authoritative webhook marks the order paid.

**8.** System creates one idempotent ACTIVE Enrollment for each course captured in the order grant snapshot.

**9.** Learner sees all newly acquired courses on the dashboard, and receives exactly one consolidated payment/enrollment email listing all granted courses (see NTF-003).

### 7.4 Journey B — Learn by building

**1.** Learner sees current stage and Build Progress.

**2.** Learner reads/watches short lesson.

**3.** Learner performs required Build Task.

**4.** Learner completes checkpoint/milestone.

**5.** System records lesson/build progress.

**6.** Next lesson/stage is unlocked according to course rules.

**7.** Learner continues until final project is ready.

### 7.5 Journey C — Publish result

**1.** Learner submits live project URL and optional repository URL.

**2.** Learner uploads screenshot and project notes.

**3.** Submission moves from DRAFT to SUBMITTED once required fields are valid (see 10.6); SUBMITTED satisfies the course completion requirement and remains editable.

**4.** Learner configures project visibility.

**5.** Public showcase page is generated.

**6.** Learner can copy/share project URL.

## 8. Functional Requirements

### 8.1 Identity & Access

**IAM-001 User registration \[P0\]**

> Guest dapat membuat akun learner menggunakan Clerk. Internal User record harus dibuat/resolved untuk setiap authenticated identity.
>
> **Acceptance:** Authenticated Clerk identity selalu memiliki tepat satu internal User ID.

**IAM-002 Login & logout \[P0\]**

> Learner dapat login/logout dan session diverifikasi server-side pada protected routes.
>
> **Acceptance:** Protected learner/admin routes tidak dapat diakses tanpa session yang valid.

**IAM-003 Account recovery \[P0\]**

> Flow verifikasi email, forgot password, dan reset password menggunakan capability Clerk.

**IAM-004 Provider isolation \[P0\]**

> Foreign key domain LMS harus menggunakan internal users.id, bukan Clerk user ID secara langsung.
>
> **Acceptance:** Enrollment, order, progress, project, dan role mengacu pada internal User ID.

**IAM-005 Google social login \[P0\]**

> Google login tersedia pada launch untuk menurunkan friction registration. Email/password tetap tersedia sebagai alternatif.
>
> **Acceptance:** Google sign-in menghasilkan/resolves internal User yang sama secara konsisten dan protected route tetap memverifikasi session server-side.

### 8.2 Catalog

**CAT-001 Course catalog \[P0\]**

> Guest dapat melihat daftar course published beserta thumbnail, title, outcome, difficulty, duration estimate, dan price.

**CAT-002 Course detail \[P0\]**

> Halaman course menunjukkan final-result preview, what-you-will-build, what-you-will-learn, curriculum, requirements, price, dan CTA.

**CAT-003 Course publishing state \[P0\]**

> Admin dapat menyimpan course sebagai DRAFT, PUBLISHED, atau UNPUBLISHED. Hanya PUBLISHED tersedia untuk guest untuk discovery dan direct purchase baru.
>
> **Acceptance:** Mengubah course dari PUBLISHED menjadi UNPUBLISHED menghentikan discovery dan pembelian baru, tetapi tidak mencabut akses learner yang sudah memiliki ACTIVE/COMPLETED Enrollment ke course tersebut. Course access tetap ditentukan oleh Enrollment (LRN-006), bukan oleh publishing state.

**CAT-004 Free course support \[P0\]**

> Course dapat memiliki harga nol dan enrollment dapat diaktifkan tanpa payment gateway.

**CAT-005 Active bundle campaign discovery \[P0\]**

> Guest dapat melihat seluruh promotional bundle yang ACTIVE dan berada dalam campaign window melalui halaman katalog bundle (`/bundles`) dan/atau homepage, serta melalui halaman detail bundle (`/bundles/[slug]`). Bundle harus menjelaskan type, harga bundle, course eligible/included, dan rule pemilihan bila `CHOOSE_N`.
>
> **Acceptance:** Ketika lebih dari satu bundle ACTIVE, guest dapat menemukan seluruh bundle tersebut tanpa mengetahui slug-nya terlebih dahulu.

**CAT-006 Course ownership indicator \[P0\]**

> Pada catalog, course detail, dan bundle selector, authenticated learner dapat melihat course yang sudah dimiliki sehingga tidak membeli course yang sama secara tidak sengaja. Indicator ini adalah UX aid; hard enforcement dilakukan server-side sesuai COM-016.

### 8.3 Commerce & Payment

**COM-001 Course as primary sellable unit \[P0\]**

> Course adalah unit jual utama. Admin dapat menetapkan harga setiap course secara independen atau menandainya FREE.
>
> **Acceptance:** Satu successful direct course purchase memberikan learner akses ke seluruh stage, lesson, build task, checkpoint, resource, dan final project dalam course tersebut sesuai access rule course. Sebuah course tidak dapat disimpan sebagai PUBLISHED dengan status paid (non-FREE) kecuali memiliki harga numerik valid lebih besar dari nol dikonfigurasi.

**COM-002 Direct course order \[P0\]**

> Saat paid course dibeli, backend membuat immutable order snapshot minimum: user, purchase type, course, item title, price, currency, dan total.

**COM-003 Promotional bundle \[P0\]**

> Admin dapat membuat bundle campaign di atas beberapa course. Bundle bukan learning container dan tidak mengubah struktur course; bundle hanya mekanisme komersial untuk memperoleh satu atau lebih course.

**COM-004 Fixed bundle \[P0\]**

> Bundle type `FIXED` memiliki daftar course yang sudah ditentukan admin. Successful purchase memberikan enrollment ke seluruh course yang disnapshot pada order.

**COM-005 Choose-N bundle \[P0\]**

> Bundle type `CHOOSE_N` memungkinkan customer memilih tepat `N` course dari daftar eligible course. Contoh: “Paket Merdeka — Rp299K, pilih 2 course”.
>
> **Acceptance:** Checkout tidak dapat dilanjutkan bila jumlah pilihan tidak sama dengan rule `N` atau ada pilihan yang tidak eligible.

**COM-006 Bundle pricing & campaign window \[P0\]**

> Bundle memiliki harga sendiri yang independen dari total harga individual course dan dapat memiliki `starts_at`/`ends_at`. Bundle hanya dapat dibeli — yaitu, hanya dapat memulai pembuatan Order baru — ketika ACTIVE dan berada di dalam campaign window.
>
> **Acceptance (bundle expiry mid-checkout):** Jika sebuah Order bundle berhasil dibuat ketika bundle berstatus ACTIVE dan berada dalam campaign window, Order tersebut tetap sah dan payable sampai dengan waktu expiry Order/Payment itu sendiri (lihat 10.1/10.2), walaupun bundle kemudian menjadi INACTIVE/EXPIRED atau keluar dari campaign window sebelum payment settlement. Bundle campaign window hanya mengontrol pembuatan Order baru, bukan validitas Order yang sudah dibuat.

**COM-007 Existing ownership rule \[P0\]**

> Course yang sudah dimiliki learner tidak dapat dipilih ulang dalam `CHOOSE_N`. Jika jumlah eligible course yang belum dimiliki lebih kecil dari `N`, bundle tidak eligible untuk learner tersebut.

**COM-008 Immutable course grant snapshot \[P0\]**

> Order bundle menyimpan exact course IDs/titles yang akan diberikan setelah pembayaran. Perubahan isi bundle setelah order dibuat tidak boleh mengubah grant pada historical order. Direct course order juga menghasilkan satu baris `OrderCourseGrant` (untuk course tunggal tersebut) agar logika aktivasi Enrollment (COM-011) seragam antara direct purchase dan bundle purchase.

**COM-009 Midtrans checkout \[P0\]**

> Backend membuat transaction melalui Midtrans; browser hanya menerima token/checkout reference yang aman.

**COM-010 Authoritative webhook \[P0\]**

> Course tidak boleh di-unlock hanya dari browser redirect/callback. Webhook/payment verification menjadi sumber utama perubahan state payment.

**COM-011 Enrollment activation \[P0\]**

> Successful direct purchase menghasilkan satu ACTIVE Enrollment untuk course. Successful bundle purchase menghasilkan satu ACTIVE Enrollment per course dalam immutable grant snapshot. Semua grant harus idempotent.
>
> **Acceptance:** Webhook retry tidak membuat enrollment ganda.

**COM-012 Order history \[P0\]**

> Learner dapat melihat pembelian direct course maupun bundle, nominal, status, serta course yang diperoleh dari transaksi tersebut.

**COM-013 Refund representation \[P0\]**

> Domain mendukung status REFUNDED walaupun workflow refund otomatis dan automatic entitlement revocation tidak wajib pada MVP. Ketika refund terjadi, Admin dapat secara manual memindahkan Enrollment terkait ke state `REVOKED` (lihat 10.4); tidak ada automation wajib yang menghubungkan REFUNDED payment dengan REVOKED enrollment pada MVP.

**COM-014 Subscription excluded from core MVP \[P0 decision\]**

> DirakitPro MVP tidak menggunakan subscription untuk membuka course library. Subscription hanya disiapkan sebagai kemungkinan produk/program terpisah di masa depan dan tidak memengaruhi access model MVP.

**COM-015 Duplicate/concurrent order prevention \[P0\]**

> Sistem tidak boleh membiarkan lebih dari satu PENDING order untuk course/bundle yang sama dari user yang sama secara bersamaan. Saat learner memulai checkout baru untuk item yang sama sementara masih ada Order PENDING miliknya yang belum expired, sistem harus mengarahkan learner ke Order PENDING yang sudah ada (reuse) daripada membuat Order baru.
>
> **Acceptance:** Tidak mungkin terdapat dua Order PENDING milik user yang sama untuk course/bundle yang sama secara simultan. Ini mencegah risiko double-charge pada repeated checkout.

**COM-016 Already-owned course purchase block \[P0\]**

> Server-side order creation untuk direct course purchase harus menolak pembuatan Order baru apabila learner sudah memiliki Enrollment ACTIVE atau COMPLETED untuk course tersebut.
>
> **Acceptance:** Percobaan checkout terhadap course yang sudah dimiliki gagal sebelum Order dibuat, dengan pesan yang jelas kepada learner.

### 8.4 Learning Workspace

**LRN-001 Learner dashboard \[P0\]**

> Dashboard menampilkan course aktif, Build Progress, current stage, dan CTA **“Lanjut Merakit”**.

**LRN-002 Course workspace \[P0\]**

> Learner memiliki workspace dengan navigation stage/lesson dan content pane.

**LRN-003 Lesson types \[P0\]**

> MVP mendukung minimum Concept, Demo, Build, Checkpoint, dan Deploy lesson types.

**LRN-004 Lesson content \[P0\]**

> Lesson dapat memuat rich text/Markdown, code block, image, video reference, resource link, task/checkpoint metadata.
>
> **Acceptance (formalized, Appendix G):** `content` disimpan sebagai array blok bertipe eksplisit — `markdown`, `code`, `image`, `video`, `resource_link`, `task` — urutan array menentukan urutan render di content pane. Blok `video` membawa `provider`-nya sendiri (mis. `youtube`, kelak `cloudflare_stream` — lihat Appendix F), bukan field terpisah di level Lesson. Konsekuensinya: satu lesson boleh punya nol, satu, atau beberapa video, dan course yang seluruhnya video, seluruhnya teks/gambar, atau campuran, semuanya valid tanpa penyesuaian skema.

**LRN-005 Lesson progress \[P0\]**

> Sistem menyimpan STARTED/COMPLETED state dan completion timestamp per learner/lesson.

**LRN-006 Course access \[P0\]**

> Hanya learner dengan valid enrollment dapat membuka paid course content. Enrollment terhadap satu course memberikan akses ke seluruh content course tersebut; tidak ada paywall per module/video pada MVP. Course access tidak berubah karena course kemudian di-UNPUBLISHED (lihat CAT-003).

**LRN-007 Course-level resources \[P0, Appendix G\]**

> Selain blok `resource_link` per-lesson (LRN-004), Course dapat memiliki daftar resource yang berlaku untuk keseluruhan course — minimal repository link, starter/asset files, dan link pendukung lain (bukan terikat ke satu lesson tertentu).
>
> **Acceptance:** Learner dapat mengakses daftar resource course-level dari mana pun di dalam learning workspace course tersebut, konsisten di semua lesson, bukan cuma muncul di satu lesson spesifik.

### 8.5 Build Progress

**BLD-001 Build milestones \[P0\]**

> Course dapat mendefinisikan milestone produk, mis. Application Shell, Database, Authentication, Deployment.

**BLD-002 Milestone completion \[P0\]**

> Learner dapat menyelesaikan checkpoint sesuai rule lesson; sistem merekam Build Progress.
>
> **Acceptance:** BuildMilestone tidak pernah ditandai selesai secara manual oleh learner. Sebuah `BuildMilestone` otomatis menjadi complete ketika seluruh CHECKPOINT lesson `REQUIRED` yang terasosiasi ke milestone tsb (via `lessons.buildMilestoneId`) sudah berstatus `COMPLETED` (LessonProgress). CHECKPOINT lesson yang `OPTIONAL` tidak menghalangi completion milestone.

**BLD-003 Progress calculation \[P0\]**

> Build Progress dihitung dari milestone course dan ditampilkan lebih dominan daripada content-consumption progress.
>
> **Acceptance:** Build Progress = proporsi `BuildMilestone` yang complete (BLD-002) terhadap total `BuildMilestone` `REQUIRED` di course tsb — dihitung dari milestone, bukan langsung dari lesson/video completion.

**BLD-004 Stage progression \[P0\]**

> Course dapat menentukan urutan stage dan lesson; MVP boleh sequential tanpa branching kompleks.

### 8.6 Project & Showcase

**PRJ-001 Project creation \[P0\]**

> Sistem secara otomatis membuat satu Project (state `DRAFT`) untuk setiap Enrollment pada saat Enrollment diaktifkan (ACTIVE). Learner tidak perlu secara eksplisit "membuat" project sebelum submission; learner langsung mengisi/mengedit Project yang sudah tersedia melalui `/projects/me/[projectId]`.
>
> **Acceptance:** Setiap ACTIVE Enrollment memiliki tepat satu Project terkait sebelum learner melakukan aksi apa pun pada project tersebut.

**PRJ-002 Project submission \[P0\]**

> Learner dapat mengirim live URL, optional repository URL, screenshot, dan notes. Live URL divalidasi sebagai well-formed `http(s)` URL sebelum submission diterima. Final project submission merupakan salah satu syarat course completion.
>
> **Acceptance (screenshot mechanism):** Untuk MVP, screenshot adalah field URL (`http(s)`, sama seperti live URL) yang learner isi sendiri dari gambar yang sudah ter-hosting di mana pun (GitHub, dsb) — bukan file upload ke Cloudflare R2. Keputusan ini menghindari membangun infrastruktur upload (presigned URL, validasi file, error handling) sebelum ada bukti kebutuhannya, konsisten dengan prinsip MVP-simplicity (4.6) dan pola yang sama dengan keputusan video hosting (Appendix F). Reversibel — upgrade ke upload asli nanti adalah penambahan, bukan migrasi data (field tetap URL string).

**PRJ-003 Project visibility \[P0\]**

> Learner dapat menetapkan project `PRIVATE` atau `PUBLIC`. Publication selalu merupakan pilihan learner dan bukan syarat course completion. Hanya pemilik (owner) Project yang dapat mengubah visibility, mengedit, atau submit project miliknya; enforcement dilakukan server-side.

**PRJ-004 Immediate shareable public showcase \[P0\]**

> Saat learner memilih PUBLIC dan menyetujui publication declaration, direct showcase link dapat aktif segera dengan moderation state `UNREVIEWED`.

**PRJ-005 Moderation state \[P0\]**

> Moderation state dipisahkan dari visibility: `UNREVIEWED`, `APPROVED`, `REJECTED`, `HIDDEN`. Admin dapat menyimpan moderation reason.

**PRJ-006 Curated public gallery \[P0\]**

> Route `/projects` adalah curated gallery. Hanya project yang PUBLIC, `APPROVED`, dan `FEATURED` yang muncul pada gallery/featured marketing surfaces.

**PRJ-007 Search indexing policy \[P0\]**

> PUBLIC + UNREVIEWED dapat dibagikan melalui direct link tetapi menggunakan `noindex` sampai APPROVED. HIDDEN/REJECTED tidak boleh tampil pada discovery surface.

**PRJ-008 Public showcase content \[P0\]**

> Public project page berisi title, author display name, screenshot, description, feature list, technology list, live URL, dan attribution platform sesuai data yang learner izinkan.

**PRJ-009 Share action \[P0\]**

> Learner dapat copy project link dan trigger share action minimum untuk LinkedIn/generic share.

**PRJ-010 OG metadata \[P0\]**

> Public showcase menghasilkan Open Graph metadata/image agar link terlihat baik saat dibagikan.

### 8.7 Admin

**ADM-001 Admin authorization \[P0\]**

> Admin route dan mutation hanya dapat dijalankan user dengan server-validated admin role.

**ADM-002 Course management \[P0\]**

> Admin dapat create/edit/publish/unpublish course dan mengatur metadata/pricing.

**ADM-003 Curriculum management \[P0\]**

> Admin dapat mengelola stage, lesson, urutan, lesson type, required/optional flag, milestone, dan resources. Drag-and-drop tidak wajib.

**ADM-004 Bundle campaign management \[P0\]**

> Admin dapat membuat/edit/activate/deactivate bundle type `FIXED` atau `CHOOSE_N`, mengatur harga, eligible courses, `N`, campaign window, dan visibility.

**ADM-005 Learner view \[P0\]**

> Admin dapat melihat learner dan enrollment dasar.

**ADM-006 Commerce view \[P0\]**

> Admin dapat melihat orders dan payment states.

**ADM-007 Project moderation \[P0\]**

> Admin dapat melihat project/submission, mengubah moderation state, menyimpan moderation reason, serta menandai/mencabut `FEATURED` untuk curated gallery.

**ADM-008 Audit log \[P0\]**

> Perubahan sensitif admin minimum pada course publish/pricing/bundle/order/project moderation dicatat dalam AdminAuditLog. Untuk MVP, AdminAuditLog adalah data forensik yang cukup dapat diperiksa langsung di database; tidak wajib memiliki halaman admin UI tersendiri untuk menampilkannya.

### 8.8 Email & Notification

**NTF-001 Transactional email \[P0\]**

> System mengirim email minimum untuk welcome/verification, payment success, enrollment activation, course completion, dan project published.

**NTF-002 Delivery failure resilience \[P0\]**

> Kegagalan email tidak boleh membatalkan payment/enrollment transaction utama.

**NTF-003 Bundle purchase consolidated email \[P0\]**

> Successful bundle purchase mengirim tepat **satu** email payment-success yang berisi ringkasan seluruh course yang diperoleh dari grant snapshot (bukan satu email terpisah per course/enrollment). Direct course purchase tetap mengirim satu email untuk course tunggal tersebut.
>
> **Acceptance:** Bundle purchase dengan N course granted menghasilkan tepat satu email transaksional yang mencantumkan seluruh N course tersebut.

### 8.9 Mentoring (Lightweight)

**MTR-001 Mentoring privat CTA \[P0\]**

> Marketing site menampilkan section statis yang mendeskripsikan layanan mentoring privat founder-led: deskripsi singkat, indicative pricing (boleh berupa rentang, tidak wajib presisi seperti course pricing), dan satu CTA button yang membuka external scheduling link (mis. Cal.com) dan/atau kontak WhatsApp di tab/window baru.
>
> Section ini secara sengaja **tidak** memiliki: booking calendar in-app, availability management, in-app payment, atau Order/Payment/Enrollment record apa pun — scheduling dan pembayaran terjadi sepenuhnya di luar sistem DirakitPro untuk MVP.
>
> **Acceptance:** Guest dapat melihat section mentoring privat di homepage/route terkait tanpa login, klik CTA membuka external link di tab baru, dan klik tersebut terekam sebagai event analytics (`mentoring_cta_clicked`, 13.1) tanpa membuat record apa pun di domain Commerce.

## 9. Learning & Content Model

### 9.1 Hierarchy

> **Course hierarchy**
>
> Course → Stage → Lesson. Stage dapat memiliki Build Milestone. Lesson memiliki type, content, task/checkpoint metadata, optional media/resources, serta `REQUIRED`/`OPTIONAL` completion flag. Pembelian/enrollment course membuka keseluruhan hierarchy course.

### 9.2 Lesson types

| **Type**   | **Purpose**                                                | **Typical learner action**           |
|------------|--------------------------------------------------------------|---------------------------------------|
| CONCEPT    | Menjelaskan konsep tepat saat dibutuhkan.                  | Read/watch short explanation.        |
| DEMO       | Menunjukkan cara atau hasil yang akan ditiru/dimodifikasi. | Observe and follow.                  |
| BUILD      | Menghasilkan bagian nyata dari project.                    | Implement task.                      |
| CHECKPOINT | Memvalidasi bahwa bagian build telah tercapai.             | Confirm required evidence/checklist. |
| DEPLOY     | Menerbitkan project ke environment publik.                 | Deploy and submit URL.               |

### 9.3 Recommended content ratio

Pedoman course, bukan hard technical constraint: sekitar 10% concept, 20% demo, 60% build, 10% reflection/checkpoint. Video tidak boleh menjadi satu-satunya medium utama.

### 9.4 Example stage language

- Make It Visible — hasil pertama muncul di layar.

- Make It Interactive — user dapat melakukan input/action.

- Make It Remember — data tersimpan secara persisten.

- Make It Personal — authentication/personalization.

- Make It Useful — dashboard/reporting/real workflow.

- Put It Online — deployment dan live URL.

## 10. Business Rules & State Models

### 10.1 Order state

Minimum states: `PENDING`, `PAID`, `EXPIRED`, `CANCELLED`, `REFUNDED`.

Allowed transitions:

```text
PENDING → PAID          (authoritative webhook confirms settlement)
PENDING → EXPIRED        (payment window elapses without settlement)
PENDING → CANCELLED      (user/system cancels before settlement)
PAID → REFUNDED          (admin-initiated refund; MVP does not require automation)
```

`PAID`, `EXPIRED`, `CANCELLED`, and `REFUNDED` are terminal states. `EXPIRED`/`CANCELLED` orders can never transition to `PAID`; a new Order must be created for a retried purchase. State change harus audit-friendly dan idempotent. Order harus menyimpan `DIRECT_COURSE` atau `BUNDLE` sebagai purchase source/type.

### 10.2 Payment state

Minimum normalized states: `PENDING`, `SETTLEMENT/PAID`, `FAILED`, `EXPIRED`, `REFUNDED`. `PENDING` moves to exactly one of the other four states based on the authoritative Midtrans webhook payload; normalized state changes drive the corresponding Order state transition in 10.1. Raw provider status tetap dapat disimpan untuk debugging/audit.

### 10.3 Bundle state

Minimum lifecycle: `DRAFT`, `ACTIVE`, `INACTIVE`, `EXPIRED`.

- `DRAFT → ACTIVE`: admin action (ADM-004).
- `ACTIVE → INACTIVE`: admin manual deactivation.
- `ACTIVE → EXPIRED`: automatic, once `now > ends_at` (if configured).
- `INACTIVE → ACTIVE`: admin manual reactivation, subject to campaign window still being valid.

`ACTIVE` tetap harus memenuhi campaign window `starts_at <= now <= ends_at` jika kedua batas waktu dikonfigurasi. Bundle state governs whether a **new** Order can be created (COM-006); it does not retroactively affect Orders already created (see COM-006 acceptance on bundle expiry mid-checkout).

Bundle type MVP hanya:

- `FIXED` — seluruh course sudah ditentukan admin.
- `CHOOSE_N` — customer memilih tepat N course dari eligible set.

### 10.4 Enrollment state

Minimum states: `ACTIVE`, `COMPLETED`, `REVOKED`. Paid enrollment dibuat hanya setelah payment successful; free enrollment dapat langsung ACTIVE. `ACTIVE → COMPLETED` occurs automatically once the course completion rule (10.7) is satisfied. `ACTIVE → REVOKED` is an admin-only manual action for MVP (e.g. fraud, chargeback, refund follow-up per COM-013); there is no automatic REFUNDED-payment-to-REVOKED-enrollment pipeline in MVP. `REVOKED` is terminal. Satu Enrollment selalu merepresentasikan akses learner terhadap satu Course, terlepas apakah course diperoleh lewat direct purchase, bundle, atau free enrollment.

### 10.5 Lesson progress state

NOT_STARTED → STARTED → COMPLETED. Completion harus idempotent dan memiliki timestamps yang cukup untuk analytics. Lesson dapat `REQUIRED` atau `OPTIONAL`.

### 10.6 Project/submission state

Project workflow minimum: `DRAFT → SUBMITTED`. `SUBMITTED` is the state that satisfies the course completion requirement (10.7/PRJ-002) and is reached once live URL, screenshot, and notes are valid. A learner may update submission fields after reaching `SUBMITTED` (e.g. refresh the live URL) without leaving the `SUBMITTED` state — there is no separate terminal "COMPLETED" submission state in MVP, since course/Enrollment completion (10.4) already carries that semantic. Visibility `PRIVATE`/`PUBLIC` dipisahkan dari workflow state. Moderation state dipisahkan lagi menjadi `UNREVIEWED`, `APPROVED`, `REJECTED`, `HIDDEN`; featuring menggunakan flag/state tersendiri.

### 10.7 Course completion rule

Enrollment menjadi `COMPLETED` hanya ketika seluruh kondisi berikut terpenuhi:

1. seluruh `REQUIRED` lessons selesai;
2. seluruh required Build Milestones selesai; dan
3. final Project Submission telah `SUBMITTED` menurut rule MVP (10.6).

Optional lesson tidak menghalangi completion. Project **tidak harus PUBLIC** untuk menyelesaikan course, dan human review tidak menjadi syarat completion MVP.

### 10.8 Critical business rules

- Course adalah primary sellable learning unit; tidak ada pricing/paywall per video atau module pada MVP.
- Successful purchase satu course memberikan akses ke seluruh course content.
- Satu user hanya memiliki satu active enrollment per course untuk MVP.
- Direct purchase dan bundle purchase berakhir pada model access yang sama: Enrollment per Course.
- Payment webhook retries tidak boleh membuat duplicate Order, Payment, atau Enrollment.
- Harga/order item disnapshot saat order dibuat agar perubahan harga course/bundle tidak mengubah historical order.
- Bundle order menyimpan immutable Course Grant Snapshot; perubahan bundle setelah checkout tidak mengubah course yang dibeli pada historical order.
- Course yang sudah dimiliki learner tidak dapat dipilih ulang di `CHOOSE_N`, dan tidak dapat dibeli ulang secara direct (COM-016).
- `CHOOSE_N` checkout hanya valid jika tepat N eligible, not-owned courses dipilih.
- Jika learner tidak memiliki minimal N eligible unowned courses, bundle tidak dapat dibeli oleh learner tersebut.
- Bundle price independen dari total harga retail course yang dipilih/dikandung.
- Course content yang unpublished tidak dapat dibeli secara direct; bundle ACTIVE tidak boleh menawarkan course yang tidak purchase-eligible menurut policy admin.
- Sebuah bundle Order yang sudah dibuat selagi bundle ACTIVE tetap payable sampai order/payment expiry-nya sendiri, meskipun bundle kemudian menjadi INACTIVE/EXPIRED (COM-006).
- Tidak boleh ada lebih dari satu PENDING order untuk item yang sama milik user yang sama secara bersamaan (COM-015).
- Paid lesson access selalu diverifikasi server-side terhadap ACTIVE/COMPLETED enrollment.
- Course access tidak dicabut ketika course kemudian di-UNPUBLISHED; hanya discovery/pembelian baru yang berhenti (CAT-003, LRN-006).
- Project publication selalu opt-in. PUBLIC + UNREVIEWED dapat memiliki direct link tetapi tidak masuk curated gallery dan menggunakan noindex.
- Hanya PUBLIC + APPROVED + FEATURED yang tampil di `/projects` curated gallery.
- Subscription bukan access model core MVP.

## 11. Data & Domain Model

### 11.1 Core entities

| **Entity** | **Responsibility / key relationship** |
|---|---|
| User | Internal application identity; maps to external auth provider identity. |
| AuthIdentity | Normalized mapping provider + provider_user_id → User. |
| Course | Primary sellable learning unit; metadata, price, status, slug, course-level resource list (LRN-007). |
| CourseStage | Ordered stage inside course. |
| Lesson | Ordered lesson, type, required/optional flag, `content` block array (markdown/code/image/video/resource_link/task — LRN-004), no dedicated video field. |
| BuildMilestone | Product-oriented milestone attached to course/stage. |
| Enrollment | User access relationship to one course, independent of purchase source. |
| LessonProgress | Per-user/per-lesson state and timestamps. |
| BuildProgress | Per-user/per-milestone completion evidence/state. |
| Bundle | Promotional campaign definition; type, price, status, selection_count, campaign window. |
| BundleCourse | Eligible/included courses for a bundle. |
| Order | Purchase header, source type, immutable commercial snapshot. |
| OrderItem | Direct course or bundle item/price snapshot. |
| OrderCourseGrant | Immutable list of exact course(s) to enroll after successful payment. Created for **both** direct-course orders (single row) and bundle orders (one row per granted course), so enrollment activation (COM-011) always reads from a uniform structure. |
| Payment | Provider transaction status, references, normalized state. |
| Project | Learner output linked to user/course/enrollment; auto-created at Enrollment activation (PRJ-001); visibility/moderation/featured state. |
| ProjectSubmission | Live URL, repository URL, notes, final submission state (`DRAFT`/`SUBMITTED` per 10.6). |
| ProjectAsset | Screenshot/media references in object storage. |
| AdminAuditLog | Administrative mutation audit including course pricing, bundles, payments, moderation. Database-level record for MVP; no dedicated admin UI page required (ADM-008). |

### 11.2 Identity isolation rule

> **Architecture rule**
>
> Domain tables MUST reference users.id. Clerk user ID is stored only as external identity mapping/reference and MUST NOT become the primary foreign key used across LMS domains.

### 11.3 Data ownership

Application business data lives in PostgreSQL. Binary/media assets live outside PostgreSQL. Video media is referenced by provider IDs. Payment raw payloads may be retained in sanitized/audit form where necessary, avoiding unnecessary sensitive data retention.

## 12. Information Architecture & Routes

### 12.1 Public routes

| **Route** | **Purpose** |
|---|---|
| / | Homepage / marketing / active campaigns |
| /courses | Course catalog |
| /courses/[slug] | Course detail / direct purchase entry |
| /bundles | Active promotional bundle campaign catalog |
| /bundles/[slug] | Promotional bundle detail / selector |
| /projects | Curated PUBLIC + APPROVED + FEATURED gallery |
| /projects/[username]/[slug] | Direct public project showcase |
| /login | Sign in entry, termasuk Google login |
| /register | Sign up entry |
| /forgot-password | Account recovery entry |

### 12.2 Learner routes

| **Route** | **Purpose** |
|---|---|
| /dashboard | Lanjut Merakit + enrolled courses |
| /learn/[courseSlug] | Course start/overview |
| /learn/[courseSlug]/[lessonSlug] | Learning workspace |
| /projects/me | Learner projects |
| /projects/me/[projectId] | Edit/submit/publish project |
| /account | Account |
| /account/orders | Direct course + bundle order history |

### 12.3 Commerce/admin/API routes

| **Route** | **Purpose** |
|---|---|
| /checkout/course/[courseSlug] | Direct course checkout entry |
| /checkout/bundle/[bundleSlug] | Bundle selection/checkout entry |
| /payment/[orderId] | Payment status/result |
| /admin | Admin dashboard |
| /admin/courses | Course/curriculum/pricing management |
| /admin/bundles | Bundle campaign management |
| /admin/users | Learner view |
| /admin/orders | Orders/payments |
| /admin/projects | Projects/moderation/featured management |
| /api/payments/midtrans/webhook | Payment webhook endpoint |

## 13. Analytics & KPI Instrumentation

### 13.1 Required events

- home_viewed

- course_viewed

- bundle_viewed

- bundle_course_selected

- checkout_started — fired uniformly for both direct-course and bundle checkout once the purchasable item/selection is valid and Order creation is about to begin.

- order_created

- bundle_purchase_started — fired when a guest/learner opens the bundle selection UI (`CHOOSE_N`) before completing a valid selection; distinct from `checkout_started`, which fires once the selection is valid and Order creation begins.

- payment_completed

- enrollment_activated

- course_started

- lesson_started

- lesson_completed

- build_checkpoint_completed

- build_milestone_completed

- course_completed

- project_submitted

- project_published

- project_approved

- project_featured

- project_shared

- mentoring_cta_clicked — fired when a visitor clicks the MTR-001 mentoring CTA; carries no Order/Payment/Enrollment linkage since scheduling happens externally.

### 13.2 Required properties

Event properties minimum harus memungkinkan funnel per course dan purchase type (`DIRECT_COURSE`/`BUNDLE`), bundle/campaign identifier bila relevan, **bundle type (`FIXED`/`CHOOSE_N`) bila relevan**, selected/granted course IDs, source/campaign attribution, user/enrollment identifier yang aman, lesson/stage/milestone identifier, price/order identifier, dan timestamp.

### 13.3 Primary funnel

Primary learning funnel: Course viewed → Checkout started → Payment completed → Course started → 50% build reached → Course completed → Project published → Project shared. Commerce analysis harus dapat membandingkan direct-course conversion versus bundle-campaign conversion, dan `FIXED` versus `CHOOSE_N` bundle conversion menggunakan bundle type property.

### 13.4 Admin/product dashboard

- Revenue and paid orders, split by direct course vs bundle.

- Bundle campaign views, checkout conversion, purchases, selected course mix, and effective discount/value.

- Active learners/enrollments.

- Course completion rate.

- Published Project Rate — harus tampil sebagai KPI utama, bukan hanya revenue.

- Drop-off stage/lesson untuk course optimization.

- Moderation throughput (`project_approved`, `project_featured` volume/latency).

- Mentoring Interest Rate — unique `mentoring_cta_clicked` visitors ÷ unique site visitors; tracked explicitly to evidence-gate the P1 built-in booking/payment decision (6.2, 5.3) rather than building it speculatively.

## 14. Technical Architecture & Stack

### 14.1 Architecture decision

> **Architecture baseline**
>
> Next.js full-stack modular monolith + PostgreSQL. Satu deployable web application, satu relational database, tetapi kode dipisahkan berdasarkan domain boundaries. Tidak menggunakan microservices pada MVP.

### 14.2 Recommended stack

| **Area**             | **Technology / decision**                                            |
|----------------------|------------------------------------------------------------------------|
| Language             | TypeScript                                                           |
| Web framework        | Next.js 16 (pin supported production release at repository creation) |
| UI                   | React + Tailwind CSS + shadcn/ui + Lucide                            |
| Forms/validation     | React Hook Form + Zod                                                |
| Authentication       | Clerk                                                                |
| Application identity | Internal User table in PostgreSQL                                    |
| Database             | PostgreSQL                                                           |
| DB hosting           | Neon for MVP, provider-neutral schema                                |
| ORM                  | Drizzle ORM                                                          |
| Payment              | Midtrans Snap + webhook                                              |
| File storage         | Cloudflare R2                                                        |
| Video                | YouTube (unlisted) for MVP; Cloudflare Stream deferred — see Appendix F |
| Email                | Resend + React Email                                                 |
| Analytics            | PostHog                                                              |
| Monitoring           | Sentry                                                               |
| Hosting              | Vercel                                                               |
| Monorepo             | pnpm + Turborepo                                                     |
| Testing              | Vitest + React Testing Library + Playwright                          |
| CI                   | GitHub Actions                                                       |

### 14.3 Deployment context

Browser → Vercel/Next.js → PostgreSQL. Next.js juga berintegrasi dengan Clerk, Midtrans, Resend, PostHog, Sentry, Cloudflare R2, dan (untuk MVP) YouTube sebagai video host. Secrets dan privileged API keys hanya tersedia server-side.

### 14.4 Repository structure

Monorepo baseline: apps/web sebagai deployable application; packages/database, auth, ui, email, validation, config untuk reusable concerns. Domain feature modules di apps/web/features: identity, catalog, learning, enrollment, progress, project, commerce, bundle, payment, media, administration.

### 14.5 Why Clerk over Supabase Auth for MVP

Clerk dipilih karena mengurangi effort pada authentication UX/session management sehingga engineering dapat fokus pada learning/build experience. Namun vendor lock-in dikurangi dengan internal User table dan provider mapping. Supabase Auth tetap viable jika strategi masa depan berubah ke ekosistem Supabase/RLS-centric, tetapi bukan baseline MVP.

### 14.6 Why Next.js over a split backend/frontend stack

> **Context:** builder utama produk ini punya pengalaman utama di Java/Spring Boot (hexagonal architecture) + React terpisah — pola yang dipakai di proyek lain di luar DirakitPro. Next.js dipilih secara sadar untuk DirakitPro, bukan default, dengan alasan berikut:

- **Organic discovery adalah bagian dari product thesis, bukan tambahan.** Opportunity (2.3) dan North-star metrics (5.3) bergantung pada public course page dan showcase gallery sebagai acquisition loop. Ini butuh server-rendered/SEO-friendly page dengan Core Web Vitals yang baik — kekuatan utama Next.js App Router, yang sulit dicapai setara oleh client-rendered React SPA tanpa menambah SSR layer terpisah.

- **Koherensi dengan keputusan single-deployable (14.1).** Split backend (Spring Boot) + frontend (React SPA) yang butuh SEO tetap memerlukan semacam SSR layer di depan (Next.js/Astro/dst), yang berarti dua stack berjalan sekaligus — bertentangan dengan keputusan "satu deployable, tanpa microservices" yang sudah dikunci di 14.1.

- **Solo-builder velocity.** Satu framework, satu type-safe boundary (TypeScript end-to-end dengan Zod), tanpa maintenance dua API contract terpisah (REST/OpenAPI di Spring Boot + client di React) untuk MVP yang sudah punya 58 requirement ID P0.

- **Trade-off yang diterima secara sadar:** learning curve pada Next.js server actions, Drizzle ORM, dan App Router — bukan zona nyaman teknis builder. Trade-off ini diterima karena dampaknya ke kecepatan solo-development dinilai lebih kecil daripada dampak SEO/discovery yang hilang bila memakai stack terpisah.

## 15. Non-Functional Requirements

### 15.1 Performance

- Public marketing/course pages harus menggunakan server rendering/static optimization yang sesuai dan memprioritaskan Core Web Vitals.

- Learner workspace harus tetap responsif pada koneksi mobile/consumer Indonesia; media berat di-load secara lazy/adaptive.

- Database queries untuk dashboard, access checks, dan progress harus memiliki indexes yang relevan sebelum production launch.

### 15.2 Reliability

- Payment webhook handler idempotent dan retry-safe untuk direct course maupun multi-course bundle grant.

- Failure email/analytics tidak boleh merusak transaction utama.

- Course access tidak bergantung pada client-side state saja.

- Database migrations harus versioned dan reproducible.

### 15.3 Accessibility

- Semantic HTML dan keyboard navigation untuk core flows.

- Form input memiliki label/error state yang jelas.

- Image course/project mendukung alt text yang relevan.

- Color contrast minimum mengikuti baseline WCAG AA untuk UI utama.

### 15.4 Responsive design

Public pages, checkout, learner dashboard, dan course workspace wajib usable pada mobile, tablet, dan desktop. Desktop boleh menawarkan richer split layout, tetapi tidak boleh membuat learner mobile terblokir.

### 15.5 Maintainability

- Domain-oriented module boundaries.

- Strict TypeScript dan shared validation schemas untuk boundary input.

- No premature repository abstraction bila tidak memberi value nyata.

- No business logic critical di UI-only code.

### 15.6 Observability

- Application errors, payment/webhook failures, and critical server failures must be captured in Sentry with enough context (order ID, user ID, event type) to diagnose without querying production data directly.

- Payment webhook errors and rejected/invalid-signature attempts must be logged distinctly from generic application errors so commerce incidents are triageable on their own.

## 16. Security Baseline

- Authentication/session handled by Clerk; authorization tetap diverifikasi oleh aplikasi server-side.

- Admin access menggunakan server-side role check dan tidak bergantung pada hidden UI.

- All write inputs validated with schema validation.

- Rate limiting minimum pada auth-sensitive/custom public mutation endpoints yang memerlukan perlindungan tambahan.

- Midtrans server key/secret hanya server-side; webhook signature/verification wajib.

- Course access check berdasarkan ACTIVE/COMPLETED enrollment; purchase source (direct/bundle) tidak mengubah authorization rule.

- Project mutation (edit, submit, visibility change) requires server-side ownership check against the authenticated learner's internal User ID (PRJ-003).

- File upload: enforce MIME/type, size, ownership, and safe object keys.

- Video berbayar menggunakan protected/signed playback mechanism bila dibutuhkan oleh provider configuration. **Untuk MVP (Appendix F): tidak terpenuhi oleh YouTube unlisted** — video dapat diputar oleh siapa pun yang punya link, terlepas dari status enrollment. Diterima sebagai trade-off sadar demi budget, bukan diabaikan diam-diam.

- Secrets tidak pernah dikirim ke browser atau committed ke repository.

- Admin sensitive mutation memiliki audit record.

- Public showcase hanya menampilkan learner data yang memang diset public.

## 17. Testing & Release Gates

### 17.1 Test stack

Vitest untuk unit/domain logic, React Testing Library untuk component behavior yang relevan, dan Playwright untuk critical end-to-end flows.

### 17.2 Critical automated coverage

- Direct course order calculation and immutable price snapshot.

- FIXED/CHOOSE_N bundle eligibility, exact-N validation, campaign window, existing ownership rule, and immutable Course Grant Snapshot.

- Bundle order remains payable after bundle becomes INACTIVE/EXPIRED post-order-creation but pre-settlement (COM-006).

- Duplicate/concurrent PENDING order prevention for the same user/item (COM-015).

- Already-owned course purchase block at order-creation time (COM-016).

- Payment state mapping and webhook idempotency for one-to-many enrollment grant.

- Enrollment creation/access control, including access persistence after course UNPUBLISHED (CAT-003/LRN-006).

- Progress calculation and milestone completion.

- Course completion rule (required lessons + required milestones + final submission).

- Project auto-creation at Enrollment activation (PRJ-001).

- Project visibility, moderation, noindex, and featured-gallery authorization.

- Bundle purchase generates exactly one consolidated transactional email (NTF-003).

- Admin authorization.

### 17.3 Required E2E flows

**1.** Register/login (including Google) → View course → Direct checkout → simulated/sandbox payment success → Enrollment → Open any course lesson.

**2.** Open `CHOOSE_N` bundle → select exactly N eligible unowned courses → checkout → payment success → N idempotent enrollments → exactly one consolidated confirmation email.

**3.** Complete required lessons/build milestones → Submit final project → Course COMPLETED while project may remain PRIVATE.

**4.** Publish project → direct PUBLIC/UNREVIEWED URL works with noindex → admin APPROVES + FEATURES → project appears on `/projects`.

### 17.4 CI quality gates

Install → lint → typecheck → unit/integration tests → build → critical E2E smoke. Production deployment hanya boleh dilakukan dari build yang melewati quality gates yang disepakati.

## 18. Risks, Assumptions & Product Lock Decisions

### 18.1 Assumptions

- Pemula Indonesia lebih mudah mengonversi pada outcome yang terlihat daripada positioning course berbasis teori.
- Project showcase cukup bernilai bagi learner untuk meningkatkan completion/share behavior.
- 3 course awal cukup untuk menguji positioning dan funnel sebelum memperluas katalog.
- Direct course purchase + campaign bundle lebih mudah dipahami target MVP dibanding library-wide subscription.
- Next.js modular monolith cukup untuk scale MVP dan early commercial traction; rationale lengkap didokumentasikan di 14.6 (bukan sekadar asumsi tak beralasan).

### 18.2 Key risks

| **Risk** | **Impact** | **Mitigation** |
|---|---|---|
| Learner hanya copy AI tanpa memahami. | Completion terlihat tinggi tetapi learning value rendah. | Checkpoint/reflection dan advanced path; AI allowed but learner validates outcome. |
| Course terlalu panjang. | Drop-off sebelum project live. | Design around milestones and time-to-first-visible-result. |
| Showcase tidak menarik untuk dibagikan. | Organic loop lemah. | Invest in project presentation, screenshot, OG card, public page quality. |
| Payment/bundle grant complexity. | Lost revenue atau duplicate/missing enrollment. | Immutable grant snapshot, webhook-authoritative, idempotent one-to-many enrollment grant, sandbox tests. |
| Promotion terlalu agresif menurunkan perceived value. | Customer menunggu diskon dan full-price conversion turun. | Bundle diperlakukan sebagai bounded campaign, bukan perpetual fake discount. |
| Vendor dependency. | Migration cost. | Internal user abstraction, provider-neutral PostgreSQL schema, external media refs. |

### 18.3 Resolved decisions for Product Lock

| Decision | V1.0 decision |
|---|---|
| Product monetization | **Individual course purchase is primary.** Buying one course unlocks all content in that course. |
| Course pricing | **Admin-configurable per course.** No hardcoded global launch price in product rules. Paid courses require a valid price > 0 to publish (COM-001). |
| Bundle campaign | **P0.** Supports `FIXED` and `CHOOSE_N`; bundle price is independent of retail total. Orders survive bundle expiry mid-checkout (COM-006). |
| Subscription | **Not core MVP.** May be introduced later for separate programs/services such as community, challenge, mentoring, or professional lab. |
| First three courses | **Rakitan Pertama — Personal Website**, **Rakit Aplikasi Keuangan Pribadi**, **Rakit Sistem Booking Bisnis**. Exact retail price remains admin-configurable. |
| Google login | **P0 launch** alongside email/password. |
| `/projects` gallery | **P0 curated gallery**, not an automatic dump of all public projects. |
| Public moderation | PUBLIC direct link may be immediate as `UNREVIEWED` + `noindex`; admin can APPROVE/REJECT/HIDE and separately FEATURE. |
| Course completion | All REQUIRED lessons + required Build Milestones + final Project Submission (`SUBMITTED`). Publication and human review are not required. |
| Duplicate checkout / already-owned purchase | **Blocked server-side** at order-creation time (COM-015, COM-016). |
| Bundle purchase email | **Exactly one consolidated email** per bundle order, not one per granted course (NTF-003). |

### 18.4 Public Brand Release Gate — not a Product Scope blocker

**DirakitPro legal/digital clearance** tetap wajib sebelum public/legal brand lock: exact trademark similarity search pada kelas relevan (minimum Class 41 dan 42; Class 9 jika downloadable application direncanakan), primary domain ownership, dan reservation of primary social handles.

Working product name untuk product/engineering tetap **DirakitPro** dengan philosophy **“Profesional itu dirakit.”** Jika formal clearance gagal, brand identifier dapat diganti tanpa membuka kembali product scope yang sudah di-lock.

**Status: PENDING** — this gate is tracked independently of the V1.0 Product Lock above and does not downgrade product readiness.

## 19. Post-MVP Roadmap

### 19.1 Product ladder

| **Level** | **DirakitPro stage** | **Customer promise** | **Potential product** |
|---|---|---|---|
| 0 — Build | Rakitan Pertama | “Saya bisa membuat aplikasi.” | Beginner outcome-first courses. |
| 1 — Understand | Rakitan Dipahami | “Saya mengerti aplikasi yang saya buat.” | Fundamentals/deconstruction classes. |
| 2 — Engineer | Rakitan Terstruktur | “Saya bisa membuatnya dengan benar.” | Engineering discipline, testing, architecture. |
| 3 — Production | Rakitan Production | “Saya bisa menjalankannya untuk user nyata.” | Security, observability, reliability, deployment. |
| 4 — Scale | Rakitan Profesional | “Saya bisa menangani sistem kompleks dan mempertanggungjawabkan keputusan saya.” | Advanced system design/simulation. |

### 19.2 Potential P1/P2 capabilities

- Human review / mentor feedback.

- AI contextual assistant tied to course/project state.

- Certificates and verified completion evidence.

- Referral/affiliate loop.

- Advanced promotion mechanics seperti coupon, buy-X-get-Y, complete-your-bundle pricing, atau segment-specific campaign.

- Optional subscription only for separate ongoing services/programs (community, challenges, reviews, labs), not as the default course access model.

- Advanced assessment and skill profile.

- Career readiness / production simulation as higher-tier offering.

## 20. MVP Definition of Done

MVP dianggap product-complete untuk public beta hanya bila seluruh kondisi berikut terpenuhi:

- Guest dapat memahami value proposition dan melihat minimal satu course published.

- User dapat register/login melalui Google maupun email/password dan internal User mapping bekerja konsisten.

- Paid course dapat dibeli secara direct melalui Midtrans dan satu successful purchase mengaktifkan satu course enrollment secara idempotent; pembelian ulang course yang sudah dimiliki dan checkout duplikat/konkuren untuk item yang sama dicegah server-side.

- Admin dapat membuat minimal satu `FIXED` dan satu `CHOOSE_N` bundle; successful bundle purchase membuat exact one-to-many course enrollments dari immutable grant snapshot dan tetap payable meskipun bundle expired setelah Order dibuat.

- Learner dapat membuka course workspace, menyelesaikan lesson/checkpoint, dan melihat Build Progress.

- Learner dapat memenuhi completion rule: seluruh REQUIRED lessons + required Build Milestones + final Project Submission (`SUBMITTED`); project boleh tetap PRIVATE.

- Learner dapat membuat PUBLIC showcase secara opt-in; UNREVIEWED direct link bekerja, dan admin dapat APPROVE/FEATURE agar project muncul di curated gallery.

- Project public memiliki shareable URL dan social metadata yang layak.

- Admin dapat mengelola course/curriculum/pricing, bundle campaign, serta melihat learner, order/payment, dan project moderation/featured state.

- Core product events terekam sehingga funnel Purchase → Build → Publish dapat dianalisis, termasuk perbedaan direct/FIXED/CHOOSE_N dan moderation funnel (approved/featured).

- Critical quality gates lint/typecheck/test/build/E2E smoke hijau.

- Security baseline untuk authz, payment webhook, upload, secret, dan admin mutation tervalidasi.

- Dokumentasi runbook/setup minimum tersedia untuk developer dan deployment. *(Engineering process deliverable; not tied to a product functional requirement ID.)*

> **Product lock status**
>
> V1.0 is **LOCKED** as of 21 August 2026, following the implementation readiness audit documented in `docs/audits/PRD_V1_IMPLEMENTATION_READINESS_AUDIT.md`. Legal/digital clearance for DirakitPro remains a **Public Brand Release Gate** (18.4), separate from and not blocking this Product Lock. After this lock, changes to P0 scope require an explicit Product Scope Change decision.

## Appendix A — Initial MVP Course Lineup

Katalog awal di-lock menjadi tiga course untuk menguji progression dari hasil personal sederhana menuju aplikasi yang lebih fungsional. **Harga retail tidak di-hardcode dalam PRD**; Admin menetapkan harga per course dan dapat menjalankan campaign bundle secara terpisah.

| **Order** | **Initial course** | **Primary learner outcome** | **Commercial role** |
|---:|---|---|---|
| 1 | **Rakitan Pertama — Personal Website** | Personal website responsive yang live dan dapat dibagikan. | Entry/acquisition course; dapat dikonfigurasi FREE atau paid oleh Admin. |
| 2 | **Rakit Aplikasi Keuangan Pribadi** | Full-stack finance tracker dengan data persisten, auth, dashboard, dan deployment. | Core paid validation course. |
| 3 | **Rakit Sistem Booking Bisnis** | Booking application dengan services, schedule, customer data, status, admin view, dan deployment. | Higher-value real-business-use-case course. |

Example campaign (illustrative, not hardcoded): **Paket Merdeka — Rp299K, pilih 2 course** dari eligible catalog menggunakan `CHOOSE_N`.

## Appendix B — V0.1 → V0.2 Decision Log

| Decision | V0.1 | V0.2 |
|---|---|---|
| Product name | Unnamed / Outcome-First LMS working title | **DirakitPro** |
| Brand philosophy | “Jangan cuma belajar. Bikin sesuatu.” | **“Profesional itu dirakit.”** |
| Beginner message | Build something until live | **“Mulai dari rakitan pertama.”** |
| Product vocabulary | Generic build-oriented LMS language | Added **Mulai Merakit, Lanjut Merakit, Progress Rakitan, Hasil Rakitan, Tunjukkan Karyamu** |
| Long-term narrative | Build → Understand → Engineer → Production → Scale | Retained and integrated into the concept of **menaikkan standar rakitan** |
| Brand status | Open decision | Working brand selected; **legal/domain/social clearance still required** before final lock |
| Canonical product document | DOCX snapshot | **Repository `PRD.md` becomes canonical editable baseline** |

## Appendix C — V0.2 → V0.3 Decision Log

| Decision | V0.2 | V0.3 |
|---|---|---|
| PRD status | Draft for Product Lock | **Product Lock Candidate** |
| Primary sellable unit | Course purchase assumed, pricing still open | **Course explicitly locked as primary sellable unit; one purchase unlocks whole course** |
| Course pricing | Exact launch pricing open | **Admin-configurable per course; no global hardcoded price rule** |
| Bundle | Not specified | **P0 promotional campaign layer with `FIXED` and `CHOOSE_N`** |
| Subscription | Explicitly out of MVP | **Still not core MVP; reserved for separate future programs/services** |
| Google login | P1/open | **P0** |
| Public gallery | Optional/open | **P0 curated gallery** |
| Moderation | Open | **PUBLIC/PRIVATE + UNREVIEWED/APPROVED/REJECTED/HIDDEN + FEATURED** |
| Course completion | Open | **Required lessons + required milestones + final submission; publication optional** |
| Initial courses | Suggested examples | **Personal Website → Finance App → Booking System locked** |
| Brand clearance | Product-lock open decision | **Moved to Public Brand Release Gate** |

### Document ownership rule

Mulai V0.2 dan ditegaskan kembali pada V0.3, `PRD.md` direkomendasikan sebagai **source of truth** yang disimpan di repository dan direview melalui Git. DOCX/PDF boleh dibuat dari Markdown untuk kebutuhan presentasi, stakeholder review, atau archival snapshot, tetapi perubahan product scope sebaiknya terlebih dahulu masuk ke `PRD.md`.

## Appendix D — V0.3 → V1.0 Implementation Readiness Remediation Log

Full findings and severity classification are in `docs/audits/PRD_V1_IMPLEMENTATION_READINESS_AUDIT.md`. Summary of changes applied to reach LOCKED status:

| # | Finding | Severity | Remediation |
|---|---|---|---|
| 1 | Bundle expiry mid-checkout (Order created while ACTIVE, bundle expires before settlement) was undefined. | BLOCKER | Added explicit rule: Order created during an ACTIVE campaign window remains payable until its own order/payment expiry (COM-006, 10.3, 10.8). |
| 2 | ProjectSubmission state model (`DRAFT → SUBMITTED → COMPLETED`) had an undefined third state contradicting the course completion rule, which only referenced `SUBMITTED`. | BLOCKER | Simplified to `DRAFT → SUBMITTED`; `SUBMITTED` satisfies completion and remains editable (10.6, 10.7). |
| 3 | PRJ-001 did not define when/how a Project record is created relative to Enrollment. | MAJOR | Defined: Project auto-created (`DRAFT`) at Enrollment activation, one per Enrollment (PRJ-001, 11.1, 17.2). |
| 4 | No public route let guests browse all ACTIVE bundle campaigns; only a per-slug detail page existed. | MAJOR | Added `/bundles` catalog route; extended CAT-005 acceptance criteria (12.1). |
| 5 | No rule prevented duplicate concurrent PENDING orders for the same item/user, risking double-charge on repeated checkout. | MAJOR | Added COM-015 (duplicate/concurrent order prevention). |
| 6 | No explicit server-side block on purchasing an already-owned course via direct checkout (only a UI "indicator" existed). | MAJOR | Added COM-016 (already-owned course purchase block). |
| 7 | Unclear whether unpublishing a course revokes access for already-enrolled learners. | MAJOR | Clarified: access persists via Enrollment regardless of publishing state (CAT-003, LRN-006, 10.8). |
| 8 | Bundle purchase could plausibly send one enrollment email per granted course, creating confusing duplicate transactional messages. | MAJOR | Added NTF-003: exactly one consolidated email per bundle order. |
| 9 | COM-001 implied per-course pricing but never forbade publishing a paid course without a valid price. | MAJOR | Added acceptance criterion: paid course requires price > 0 to publish. |
| 10 | Order/Payment/Bundle/Enrollment state sections listed states without an explicit transition graph. | MINOR | Added explicit allowed-transition lists (10.1–10.4). |
| 11 | OrderCourseGrant's applicability to direct-course orders (vs. bundle-only) was ambiguous. | MINOR | Clarified it is created uniformly for direct and bundle orders (COM-008, 11.1). |
| 12 | AdminAuditLog had no admin UI route, risking an invented "view audit log" page. | MINOR | Clarified DB-level record is sufficient for MVP; no dedicated UI required (ADM-008, 11.1). |
| 13 | Analytics could not differentiate `FIXED` vs `CHOOSE_N` bundle conversion. | MINOR | Added `bundle_type` to required event properties (13.2, 13.3). |
| 14 | `bundle_purchase_started` event's meaning overlapped ambiguously with `checkout_started`. | MINOR | Clarified distinct firing points for each event (13.1). |
| 15 | No analytics events for admin moderation actions (approve/feature), leaving a blind spot in the showcase funnel. | MINOR | Added `project_approved` and `project_featured` events (13.1, 13.4). |
| 16 | NFR section had no explicit observability requirement despite Sentry being in the stack. | MINOR | Added section 15.6 Observability. |
| 17 | No explicit server-side ownership check requirement for editing/submitting a learner's own project. | MINOR | Added to PRJ-003 and Security Baseline (16). |
| 18 | PRJ-002 did not require live URL format validation. | MINOR | Added well-formed `http(s)` URL validation requirement. |
| 19 | Enrollment `REVOKED` trigger was unspecified. | MINOR | Clarified as admin-only manual action for MVP (10.4, COM-013). |

## Appendix E — V1.0 → V1.1 Product Scope Change Log

**Date:** 23 August 2026. **Trigger:** post-lock product review — founder confirmed private mentoring remains a real revenue goal for DirakitPro, but no scope for it existed in V1.0 beyond a deferred, non-actionable P1 bullet ("human review/mentor feedback"), and the Next.js architecture decision (14.1) had no documented rationale, only a bare assumption (18.1).

This is the first change made under the Product Scope Change policy stated at the top of this document. Unlike Appendix B–D, which record pre-lock drafting history, this entry records a **post-lock** decision and is why the document version moved to V1.1 instead of being edited silently under V1.0.

| Decision | V1.0 | V1.1 |
|---|---|---|
| Mentoring privat | Not specified as a product surface; only "human project review / mentor feedback" existed as a vague P1 bullet with no route, no CTA, no requirement ID. | **New P0**: MTR-001 — static marketing section + external scheduling CTA (Cal.com/WhatsApp), no in-app booking or payment. Explicitly kept outside the Order/Payment/Enrollment domain to avoid re-opening locked commerce scope. |
| In-app mentoring booking/payment engine | Not addressed. | **Explicitly P1, evidence-gated** — scoped in only once Mentoring Interest Rate (5.3) shows sustained CTA click demand, not built speculatively. |
| Mentor marketplace (multi-mentor, third-party) | Non-goal (5.2), anti-persona (3.4). | **Unchanged.** Clarified in 5.2 that this non-goal is distinct from founder-led MTR-001. |
| Next.js vs. Spring Boot + React | Assumption stated (18.1) with no rationale; builder's primary expertise is Spring Boot, creating latent risk the choice was inherited rather than deliberate. | **Confirmed deliberate**, with documented rationale added at 14.6: SEO/organic-discovery dependency of the product thesis, coherence with the single-deployable decision (14.1), and solo-builder velocity — trade-off against builder's Spring Boot comfort zone accepted explicitly rather than left implicit. |
| Analytics | No CTA-level signal for mentoring demand. | Added `mentoring_cta_clicked` event (13.1) and Mentoring Interest Rate dashboard metric (13.4) so the P1 upgrade decision is evidence-based. |

**Scope discipline check:** no Order/Payment/Enrollment domain entity changed. No new P0 route touches commerce state. MTR-001 is additive and isolated — it does not require re-opening any of the 58 locked P0 requirement IDs from V1.0.

## Appendix F — V1.1 → V1.2 Product Scope Change Log

**Date:** 24 August 2026. **Trigger:** budget constraint raised ahead of Wave 5 (Learning) — founder is self-funding pre-revenue and cannot commit to Cloudflare Stream's per-minute storage/delivery cost before validating demand for the course lineup itself.

| Decision | V1.1 (original) | V1.2 (amended) |
|---|---|---|
| Video hosting | Cloudflare Stream (14.2, 11.3) — signed/protected playback, video access tied to enrollment. | **YouTube (unlisted) for MVP.** `videoProviderId` stores a YouTube video ID instead of a Cloudflare Stream ID — the field was already provider-neutral (11.3), so this is a value-level change, not a schema change. |
| Security baseline (§16, signed playback) | Required "bila dibutuhkan oleh provider configuration." | **Explicitly not met for MVP.** An unlisted YouTube link is playable by anyone who has it, independent of enrollment status. Accepted trade-off, not an oversight — see rationale below. |

**Why this is an acceptable trade-off for MVP, not just a cost shortcut:**
- Course prices are modest (Rp149.000–199.000) and the content is instructional (build-along tutorials), not premium entertainment — the piracy incentive is low relative to, say, a film or exclusive live event.
- "Unlisted" still removes the content from YouTube search/recommendations — the realistic leak vector is a link shared peer-to-peer, not organic discovery of the video by non-payers.
- The greater near-term risk this MVP is testing is **demand**, not **piracy** — spending on Cloudflare Stream before knowing anyone will pay for the course lineup at all is the kind of premature investment the PRD's own MVP-simplicity principle (4.6) already warns against.

**Reversibility:** cheap to migrate later. `videoProviderId` is a plain string column with no foreign key or format constraint tied to a specific provider — moving to Cloudflare Stream once revenue justifies it means re-uploading video and swapping the stored ID and the embed component, not a schema migration or a rewrite of any Commerce/Enrollment logic. This decision should be revisited once there's evidence of real payment volume, not on a fixed timeline.

**Scope discipline check:** no schema/migration change. No P0 requirement ID added or removed. Affects only the video-hosting implementation detail behind LRN-004 and the §16 security-baseline line noted above.

## Appendix G — V1.2 → V1.3 Product Scope Change Log

**Date:** 24 August 2026. **Trigger:** resolving the content-block open question flagged since the Wave 3 `SCREEN_INVENTORY.md` discussion, prompted by the founder's requirement that some courses may be video-only, some text/image-only, and every course needs a persistent resource hub (repo, assets, supporting links) independent of any single lesson.

| Decision | Before | After |
|---|---|---|
| Video representation | Ambiguous — a separate `lessons.videoProviderId` column existed alongside `content` JSONB with no stated rule for which was authoritative (flagged, not resolved, in `SCREEN_INVENTORY.md`). | **Resolved: video is purely a `content` block type** (`{ type: "video", provider, videoId }`). `lessons.videoProviderId` column removed — one source of truth. A lesson may contain zero, one, or several video blocks; a course that's entirely video, entirely text/image, or mixed are all valid with zero schema difference between them. |
| Content block types | Listed only in LRN-004 prose, never formally enumerated. | **Formalized** (LRN-004 acceptance): `markdown`, `code`, `image`, `video`, `resource_link`, `task`. Array order = render order. |
| Course-level resources | Not specified — LRN-004's `resource_link` block only existed at lesson granularity. | **New LRN-007**: `courses` gains a `resources` field (same block-array pattern as lesson `content`) for course-wide repo/asset/link items, visible throughout the workspace regardless of which lesson the learner is currently on. |

**Migration note — unlike Appendix E/F, this one touches schema, not just documentation:** requires `ALTER TABLE lessons DROP COLUMN video_provider_id` and `ALTER TABLE courses ADD COLUMN resources jsonb NOT NULL DEFAULT '[]'`. Safe to run directly with no data-migration step — no lesson content exists yet since Wave 5 hasn't started, so this is a pure schema change with nothing to backfill.

**Scope discipline check:** both changes are additive/clarifying within the Learning domain (LRN-*) only. No Order/Payment/Enrollment/Commerce table touched.