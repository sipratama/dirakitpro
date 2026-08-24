import { and, eq } from "drizzle-orm";
import { db } from "./client";
import {
  buildMilestones,
  bundleCourses,
  bundles,
  courses,
  courseStages,
  lessons,
  type Bundle,
  type BuildMilestone,
  type Course,
  type CourseStage,
  type Lesson,
  type NewBundle,
  type NewCourse,
} from "./schema";

// LRN-004 (Appendix G) block shapes — duplicated here rather than imported
// from apps/web's features/learning/content-block.ts on purpose: packages/*
// are leaf dependencies of apps/web, never the other way around (14.4).
type SeedMarkdownBlock = { type: "markdown"; markdown: string };
type SeedCodeBlock = { type: "code"; language: string; code: string };
type SeedImageBlock = { type: "image"; url: string; alt: string; caption?: string };
type SeedVideoBlock = { type: "video"; provider: "youtube"; videoId: string };
type SeedResourceLinkBlock = { type: "resource_link"; label: string; url: string };
type SeedTaskBlock = { type: "task"; items: { id: string; label: string }[] };
type SeedContentBlock =
  | SeedMarkdownBlock
  | SeedCodeBlock
  | SeedImageBlock
  | SeedVideoBlock
  | SeedResourceLinkBlock
  | SeedTaskBlock;

// `key` is a seed-local handle only (never stored) — resolved to a real
// buildMilestones.id per course before lessons are upserted, so a CHECKPOINT
// lesson below can reference "database" instead of a UUID it can't know yet.
type SeedMilestone = { key: string; title: string; position: number; isRequired: boolean };

type SeedLesson = {
  slug: string;
  title: string;
  type: Lesson["type"];
  position: number;
  content: SeedContentBlock[];
  buildMilestoneKey?: string; // BLD-002: set only on CHECKPOINT lessons that fulfill a milestone
};
type SeedStage = { title: string; position: number; lessons: SeedLesson[] };
type SeedCourse = Omit<NewCourse, "status" | "publishedAt" | "resources"> & {
  resources: SeedContentBlock[]; // LRN-007
  milestones: SeedMilestone[];
  stages: SeedStage[];
};

// Appendix A — Initial MVP Course Lineup (locked). Stage names come from 9.4
// "Example stage language", picked per course based on what that course
// actually builds (e.g. a static personal site has no "Make It Remember"
// stage; the finance/booking apps do). Milestone names come from BLD-001's
// own examples (Application Shell, Database, Authentication, Deployment),
// used only where relevant to what that course actually builds.
const SEED_COURSES: SeedCourse[] = [
  {
    slug: "rakitan-pertama-personal-website",
    title: "Rakitan Pertama — Personal Website",
    outcomeDescription: "Personal website responsive yang live dan dapat dibagikan.",
    description:
      "Belajar dasar HTML, CSS, dan JavaScript sambil membangun personal website dari nol sampai online — cocok untuk pemula yang belum pernah coding sama sekali.",
    difficulty: "Pemula",
    durationEstimate: "6 jam",
    price: "0", // CAT-004: entry/acquisition course, configurable FREE
    resources: [
      { type: "resource_link", label: "Starter repo (HTML5 Boilerplate)", url: "https://github.com/h5bp/html5-boilerplate" },
      { type: "resource_link", label: "Asset & foto gratis", url: "https://unsplash.com" },
    ],
    // A free, single-page-site course doesn't need the full four-milestone
    // ladder — one milestone ("is it actually live") is a reasonable-sized
    // build goal for this course.
    milestones: [{ key: "live", title: "Live di internet", position: 1, isRequired: true }],
    stages: [
      {
        title: "Make It Visible",
        position: 1,
        lessons: [
          {
            slug: "kenalan-html-css",
            title: "Kenalan dengan HTML & CSS",
            type: "CONCEPT",
            position: 1,
            content: [
              { type: "markdown", markdown: "HTML membentuk struktur halaman, CSS mengatur tampilannya. Yuk kenalan dulu sebelum mulai merakit." },
              {
                type: "code",
                language: "html",
                code: "<!doctype html>\n<html>\n  <head><title>Halo Dunia</title></head>\n  <body><h1>Ini website pertamaku</h1></body>\n</html>",
              },
            ],
          },
          {
            slug: "bangun-halaman-personal-pertama",
            title: "Bangun halaman personal pertama",
            type: "BUILD",
            position: 2,
            content: [
              { type: "markdown", markdown: "Sekarang rakit halaman personal pertamamu — nama, foto, dan satu kalimat tentang dirimu." },
              { type: "image", url: "https://placehold.co/800x450?text=Preview+Halaman+Personal", alt: "Contoh preview halaman personal", caption: "Target tampilan setelah lesson ini" },
            ],
          },
        ],
      },
      {
        title: "Make It Interactive",
        position: 2,
        lessons: [
          {
            slug: "interaksi-dasar-javascript",
            title: "Interaksi dasar dengan JavaScript",
            type: "DEMO",
            position: 1,
            content: [
              { type: "markdown", markdown: "JavaScript yang bikin halamanmu bisa merespons klik dan input. Tonton dulu contohnya." },
              { type: "video", provider: "youtube", videoId: "PkZNo7MFNFg" },
            ],
          },
          {
            slug: "rakit-navigasi-responsive",
            title: "Rakit navigasi responsive",
            type: "BUILD",
            position: 2,
            content: [
              { type: "markdown", markdown: "Rakit menu navigasi yang tetap enak dipakai di HP maupun desktop." },
              { type: "code", language: "css", code: "@media (max-width: 640px) {\n  nav { flex-direction: column; }\n}" },
            ],
          },
        ],
      },
      {
        title: "Put It Online",
        position: 3,
        lessons: [
          {
            slug: "deploy-website-ke-hosting",
            title: "Deploy website ke hosting",
            type: "DEPLOY",
            position: 1,
            content: [
              { type: "markdown", markdown: "Terbitkan website-mu supaya bisa dibuka siapa saja lewat link publik." },
              { type: "resource_link", label: "Panduan deploy di Vercel", url: "https://vercel.com/docs/deployments/overview" },
            ],
          },
          {
            slug: "konfirmasi-website-live",
            title: "Konfirmasi website sudah live",
            type: "CHECKPOINT",
            position: 2,
            buildMilestoneKey: "live",
            content: [
              { type: "markdown", markdown: "Cek lagi hasil deploy-mu sebelum ditandai selesai." },
              {
                type: "task",
                items: [
                  { id: "live-url", label: "Website bisa diakses lewat URL publik" },
                  { id: "live-responsive", label: "Tampilan tetap rapi di layar HP" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "rakit-aplikasi-keuangan-pribadi",
    title: "Rakit Aplikasi Keuangan Pribadi",
    outcomeDescription: "Full-stack finance tracker dengan data persisten, auth, dashboard, dan deployment.",
    description:
      "Bangun aplikasi pencatatan keuangan pribadi lengkap dengan database, autentikasi, dan dashboard — belajar full-stack development lewat use-case yang nyata dipakai sehari-hari.",
    difficulty: "Menengah",
    durationEstimate: "12 jam",
    price: "149000", // core paid validation course
    resources: [
      { type: "resource_link", label: "Starter repo (Next.js full-stack)", url: "https://github.com/vercel/next-learn" },
      { type: "resource_link", label: "Ikon UI gratis", url: "https://heroicons.com" },
    ],
    milestones: [
      { key: "shell", title: "Application Shell", position: 1, isRequired: true },
      { key: "database", title: "Database", position: 2, isRequired: true },
      { key: "auth", title: "Authentication", position: 3, isRequired: true },
      { key: "deployment", title: "Deployment", position: 4, isRequired: true },
    ],
    stages: [
      {
        title: "Make It Visible",
        position: 1,
        lessons: [
          {
            slug: "rancang-dashboard-keuangan",
            title: "Rancang dashboard keuangan",
            type: "CONCEPT",
            position: 1,
            content: [{ type: "markdown", markdown: "Sebelum coding, rancang dulu dashboard-nya: ringkasan saldo, daftar transaksi, dan kategori." }],
          },
          {
            slug: "bangun-tampilan-dashboard",
            title: "Bangun tampilan dashboard",
            type: "BUILD",
            position: 2,
            content: [
              { type: "markdown", markdown: "Rakit dashboard shell-nya dulu — belum perlu data asli, cukup layout dan komponennya." },
              { type: "image", url: "https://placehold.co/800x450?text=Dashboard+Keuangan", alt: "Contoh dashboard keuangan", caption: "Target layout dashboard" },
            ],
          },
          {
            slug: "konfirmasi-dashboard-shell",
            title: "Konfirmasi dashboard shell siap",
            type: "CHECKPOINT",
            position: 3,
            buildMilestoneKey: "shell",
            content: [
              { type: "markdown", markdown: "Pastikan shell dashboard-nya benar-benar jalan sebelum lanjut ke database." },
              {
                type: "task",
                items: [
                  { id: "shell-renders", label: "Dashboard shell tampil tanpa error" },
                  { id: "shell-responsive", label: "Layout tetap rapi di mobile & desktop" },
                ],
              },
            ],
          },
        ],
      },
      {
        title: "Make It Remember",
        position: 2,
        lessons: [
          {
            slug: "setup-database-transaksi",
            title: "Setup database transaksi",
            type: "DEMO",
            position: 1,
            content: [
              { type: "markdown", markdown: "Kenalan dengan Postgres dan skema tabel transaksi sebelum mulai nulis migration." },
              { type: "video", provider: "youtube", videoId: "qw--VYLpxG4" },
            ],
          },
          {
            slug: "simpan-data-transaksi",
            title: "Simpan data transaksi",
            type: "BUILD",
            position: 2,
            content: [
              { type: "markdown", markdown: "Sambungkan form transaksi ke database — setiap transaksi baru harus benar-benar tersimpan." },
              {
                type: "code",
                language: "ts",
                code: "await db.insert(transactions).values({ userId, amount, category, occurredAt: new Date() });",
              },
            ],
          },
          {
            slug: "konfirmasi-skema-database",
            title: "Konfirmasi skema database siap",
            type: "CHECKPOINT",
            position: 3,
            buildMilestoneKey: "database",
            content: [
              { type: "markdown", markdown: "Checkpoint pertama untuk milestone Database — baru soal skemanya, belum soal datanya." },
              {
                type: "task",
                items: [
                  { id: "db-tables", label: "Tabel transaksi dan kategori sudah dibuat" },
                  { id: "db-migration", label: "Migration berhasil dijalankan tanpa error" },
                ],
              },
            ],
          },
          {
            slug: "konfirmasi-data-transaksi-tersimpan",
            title: "Konfirmasi data transaksi tersimpan",
            type: "CHECKPOINT",
            position: 4,
            buildMilestoneKey: "database",
            content: [
              {
                type: "markdown",
                markdown: "Checkpoint kedua — milestone Database baru selesai setelah checkpoint ini JUGA ditandai, bukan cuma yang pertama.",
              },
              {
                type: "task",
                items: [
                  { id: "db-insert-works", label: "Transaksi baru berhasil disimpan ke database" },
                  { id: "db-persists", label: "Data transaksi tetap ada setelah halaman di-refresh" },
                ],
              },
            ],
          },
        ],
      },
      {
        title: "Make It Personal",
        position: 3,
        lessons: [
          {
            slug: "autentikasi-dan-personalisasi",
            title: "Autentikasi & personalisasi data",
            type: "CONCEPT",
            position: 1,
            content: [
              { type: "markdown", markdown: "Setiap user cuma boleh lihat transaksinya sendiri — ini kenapa auth dan personalisasi data penting." },
              { type: "resource_link", label: "Dokumentasi Clerk", url: "https://clerk.com/docs" },
            ],
          },
          {
            slug: "rakit-login-user",
            title: "Rakit login user",
            type: "BUILD",
            position: 2,
            content: [{ type: "markdown", markdown: "Pasang login/logout dan pastikan data transaksi ke-filter per user." }],
          },
          {
            slug: "konfirmasi-login-berhasil",
            title: "Konfirmasi login & isolasi data user",
            type: "CHECKPOINT",
            position: 3,
            buildMilestoneKey: "auth",
            content: [
              { type: "markdown", markdown: "Konfirmasi login jalan DAN tidak ada kebocoran data antar user." },
              {
                type: "task",
                items: [
                  { id: "auth-login", label: "User bisa login dan logout" },
                  { id: "auth-isolation", label: "Data transaksi hanya terlihat oleh pemiliknya" },
                ],
              },
            ],
          },
        ],
      },
      {
        title: "Put It Online",
        position: 4,
        lessons: [
          {
            slug: "deploy-aplikasi-keuangan",
            title: "Deploy aplikasi keuangan",
            type: "DEPLOY",
            position: 1,
            content: [
              { type: "markdown", markdown: "Terbitkan aplikasinya ke production, lengkap dengan environment variable yang benar." },
              { type: "resource_link", label: "Panduan deploy di Vercel", url: "https://vercel.com/docs/deployments/overview" },
            ],
          },
          {
            slug: "konfirmasi-aplikasi-live",
            title: "Konfirmasi aplikasi live di production",
            type: "CHECKPOINT",
            position: 2,
            buildMilestoneKey: "deployment",
            content: [
              { type: "markdown", markdown: "Cek production-nya beneran jalan, bukan cuma jalan di local." },
              {
                type: "task",
                items: [
                  { id: "deploy-url", label: "Aplikasi bisa diakses lewat URL production" },
                  { id: "deploy-env", label: "Environment variable production sudah benar" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "rakit-sistem-booking-bisnis",
    title: "Rakit Sistem Booking Bisnis",
    outcomeDescription: "Booking application dengan services, schedule, customer data, status, admin view, dan deployment.",
    description:
      "Bangun sistem booking untuk bisnis nyata — dari alur pemesanan customer, pengelolaan schedule dan status, sampai admin view dan deployment ke production.",
    difficulty: "Menengah–Lanjutan",
    durationEstimate: "16 jam",
    price: "199000", // higher-value real-business-use-case course
    resources: [
      { type: "resource_link", label: "Starter repo (UI kit admin)", url: "https://github.com/shadcn-ui/ui" },
      { type: "resource_link", label: "Font gratis untuk UI", url: "https://fonts.google.com" },
    ],
    milestones: [
      { key: "shell", title: "Application Shell", position: 1, isRequired: true },
      { key: "database", title: "Database", position: 2, isRequired: true },
      { key: "deployment", title: "Deployment", position: 3, isRequired: true },
    ],
    stages: [
      {
        title: "Make It Visible",
        position: 1,
        lessons: [
          {
            slug: "rancang-alur-booking",
            title: "Rancang alur booking",
            type: "CONCEPT",
            position: 1,
            content: [{ type: "markdown", markdown: "Petakan dulu alur booking dari sisi customer: pilih layanan, pilih jadwal, konfirmasi." }],
          },
          {
            slug: "bangun-halaman-booking",
            title: "Bangun halaman booking",
            type: "BUILD",
            position: 2,
            content: [
              { type: "markdown", markdown: "Rakit halaman booking-nya — form pilih layanan dan jadwal dulu, belum perlu logic penuh." },
              { type: "image", url: "https://placehold.co/800x450?text=Halaman+Booking", alt: "Contoh halaman booking", caption: "Target tampilan form booking" },
            ],
          },
          {
            slug: "konfirmasi-halaman-booking-tampil",
            title: "Konfirmasi halaman booking siap",
            type: "CHECKPOINT",
            position: 3,
            buildMilestoneKey: "shell",
            content: [
              { type: "markdown", markdown: "Pastikan shell halaman booking-nya beres sebelum lanjut ke penyimpanan data." },
              {
                type: "task",
                items: [
                  { id: "shell-page", label: "Halaman booking bisa diakses" },
                  { id: "shell-form", label: "Form booking tampil dengan benar" },
                ],
              },
            ],
          },
        ],
      },
      {
        title: "Make It Remember",
        position: 2,
        lessons: [
          {
            slug: "simpan-data-booking-customer",
            title: "Simpan data booking & customer",
            type: "BUILD",
            position: 1,
            content: [
              { type: "markdown", markdown: "Sambungkan form booking ke database — data customer dan booking harus benar-benar tersimpan." },
              { type: "code", language: "ts", code: "await db.insert(bookings).values({ customerId, serviceId, scheduledAt, status: \"PENDING\" });" },
            ],
          },
          {
            slug: "kelola-status-booking",
            title: "Kelola status booking",
            type: "DEMO",
            position: 2,
            content: [{ type: "markdown", markdown: "Lihat contoh alur status booking: PENDING → CONFIRMED → DONE (atau CANCELLED)." }],
          },
          {
            slug: "konfirmasi-data-booking-tersimpan",
            title: "Konfirmasi data booking tersimpan",
            type: "CHECKPOINT",
            position: 3,
            buildMilestoneKey: "database",
            content: [
              { type: "markdown", markdown: "Checkpoint pertama milestone Database — cek data booking-nya, belum soal statusnya." },
              {
                type: "task",
                items: [
                  { id: "db-booking-saved", label: "Booking baru berhasil disimpan ke database" },
                  { id: "db-customer-linked", label: "Data booking terhubung ke customer yang benar" },
                ],
              },
            ],
          },
          {
            slug: "konfirmasi-status-booking-berubah",
            title: "Konfirmasi perubahan status booking tersimpan",
            type: "CHECKPOINT",
            position: 4,
            buildMilestoneKey: "database",
            content: [
              {
                type: "markdown",
                markdown: "Checkpoint kedua — milestone Database baru selesai setelah checkpoint ini JUGA ditandai, bukan cuma yang pertama.",
              },
              {
                type: "task",
                items: [
                  { id: "db-status-updates", label: "Perubahan status booking tersimpan dengan benar" },
                  { id: "db-status-persists", label: "Status terbaru tetap ada setelah halaman di-refresh" },
                ],
              },
            ],
          },
        ],
      },
      {
        title: "Make It Useful",
        position: 3,
        lessons: [
          {
            slug: "bangun-admin-view",
            title: "Bangun admin view",
            type: "CONCEPT",
            position: 1,
            content: [
              { type: "markdown", markdown: "Admin butuh satu tempat untuk melihat semua booking masuk dan mengubah statusnya." },
              { type: "resource_link", label: "Komponen tabel admin (shadcn/ui)", url: "https://ui.shadcn.com/docs/components/table" },
            ],
          },
          {
            slug: "rakit-dashboard-admin-booking",
            title: "Rakit dashboard admin booking",
            type: "BUILD",
            position: 2,
            content: [{ type: "markdown", markdown: "Rakit dashboard admin-nya: daftar booking, filter status, dan aksi ubah status." }],
          },
        ],
      },
      {
        title: "Put It Online",
        position: 4,
        lessons: [
          {
            slug: "deploy-sistem-booking",
            title: "Deploy sistem booking",
            type: "DEPLOY",
            position: 1,
            content: [
              { type: "markdown", markdown: "Terbitkan sistem booking-nya ke production supaya bisa dipakai bisnis sungguhan." },
              { type: "resource_link", label: "Panduan deploy di Vercel", url: "https://vercel.com/docs/deployments/overview" },
            ],
          },
          {
            slug: "konfirmasi-sistem-live",
            title: "Konfirmasi sistem live di production",
            type: "CHECKPOINT",
            position: 2,
            buildMilestoneKey: "deployment",
            content: [
              { type: "markdown", markdown: "Cek production-nya beneran jalan, bukan cuma jalan di local." },
              {
                type: "task",
                items: [
                  { id: "deploy-url", label: "Sistem bisa diakses lewat URL production" },
                  { id: "deploy-flow", label: "Alur booking end-to-end jalan di production" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

// Example campaign from Appendix A: "Paket Merdeka — Rp299K, pilih 2 course".
// Eligible set = the two paid courses (the FREE course wouldn't make sense as
// a CHOOSE_N eligible slot). Window: today through +30 days.
const SEED_BUNDLE = {
  slug: "paket-merdeka",
  title: "Paket Merdeka",
  description: "Pilih 2 course dari katalog eligible dengan harga spesial.",
  type: "CHOOSE_N" as const,
  selectionCount: 2,
  price: "299000",
  status: "ACTIVE" as const,
  eligibleCourseSlugs: ["rakit-aplikasi-keuangan-pribadi", "rakit-sistem-booking-bisnis"],
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// True upsert (insert-or-update), not insert-or-skip: this seed has already
// run against local dev DBs before content/resources were filled in below,
// so a plain onConflictDoNothing would leave those already-inserted rows
// stale forever. `publishedAt` is deliberately left out of the update set —
// it should record the first publish, not get bumped every re-seed.
async function upsertCourse(input: SeedCourse): Promise<Course> {
  const { stages, milestones, ...courseFields } = input;
  const [course] = await db
    .insert(courses)
    .values({ ...courseFields, status: "PUBLISHED", publishedAt: new Date() })
    .onConflictDoUpdate({ target: courses.slug, set: { ...courseFields, status: "PUBLISHED" } })
    .returning();
  return course;
}

async function upsertStage(courseId: string, stage: SeedStage): Promise<CourseStage> {
  const [inserted] = await db
    .insert(courseStages)
    .values({ courseId, title: stage.title, position: stage.position })
    .onConflictDoNothing({ target: [courseStages.courseId, courseStages.position] })
    .returning();
  if (inserted) return inserted;

  const [existing] = await db
    .select()
    .from(courseStages)
    .where(and(eq(courseStages.courseId, courseId), eq(courseStages.position, stage.position)))
    .limit(1);
  if (!existing) throw new Error(`Failed to upsert stage "${stage.title}" for course ${courseId}`);
  return existing;
}

// No unique index exists on build_milestones (unlike stages/lessons), so this
// upserts by hand: match on (courseId, title), update if found, insert if not.
async function upsertMilestone(courseId: string, milestone: SeedMilestone): Promise<BuildMilestone> {
  const [existing] = await db
    .select()
    .from(buildMilestones)
    .where(and(eq(buildMilestones.courseId, courseId), eq(buildMilestones.title, milestone.title)))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(buildMilestones)
      .set({ position: milestone.position, isRequired: milestone.isRequired })
      .where(eq(buildMilestones.id, existing.id))
      .returning();
    return updated;
  }

  const [inserted] = await db
    .insert(buildMilestones)
    .values({ courseId, title: milestone.title, position: milestone.position, isRequired: milestone.isRequired })
    .returning();
  return inserted;
}

async function upsertLesson(
  courseId: string,
  courseStageId: string,
  lesson: SeedLesson,
  milestoneIdByKey: Map<string, string>,
): Promise<Lesson> {
  let buildMilestoneId: string | null = null;
  if (lesson.buildMilestoneKey) {
    const resolved = milestoneIdByKey.get(lesson.buildMilestoneKey);
    if (!resolved) {
      throw new Error(`Lesson "${lesson.slug}" references unknown milestone key "${lesson.buildMilestoneKey}"`);
    }
    buildMilestoneId = resolved;
  }

  const values = {
    courseId,
    courseStageId,
    slug: lesson.slug,
    title: lesson.title,
    type: lesson.type,
    position: lesson.position,
    content: lesson.content,
    buildMilestoneId,
  };

  const [row] = await db
    .insert(lessons)
    .values(values)
    .onConflictDoUpdate({ target: [lessons.courseId, lessons.slug], set: values })
    .returning();
  return row;
}

async function upsertBundle(input: NewBundle): Promise<Bundle> {
  const [inserted] = await db.insert(bundles).values(input).onConflictDoNothing({ target: bundles.slug }).returning();
  if (inserted) return inserted;

  const [existing] = await db.select().from(bundles).where(eq(bundles.slug, input.slug)).limit(1);
  if (!existing) throw new Error(`Failed to upsert bundle "${input.slug}"`);
  return existing;
}

async function upsertBundleCourse(bundleId: string, courseId: string): Promise<void> {
  await db
    .insert(bundleCourses)
    .values({ bundleId, courseId })
    .onConflictDoNothing({ target: [bundleCourses.bundleId, bundleCourses.courseId] });
}

export type SeedResult = { courses: Course[]; bundle: Bundle };

/**
 * Idempotent MVP catalog seed (Appendix A course lineup + one example bundle
 * campaign, 9.4 stage language, Appendix G content blocks, BLD-001
 * milestones). Safe to run repeatedly — courses/lessons are true upserts
 * (content stays in sync with this file on every run), stages/bundle/grants
 * are conflict-checked inserts, and BuildProgress/LessonProgress are never
 * touched here at all, so every re-seed starts learners at 0/N progress.
 */
export async function seed(): Promise<SeedResult> {
  const seededCourses: Course[] = [];
  const coursesBySlug = new Map<string, Course>();

  for (const seedCourse of SEED_COURSES) {
    const course = await upsertCourse(seedCourse);
    seededCourses.push(course);
    coursesBySlug.set(course.slug, course);

    const milestoneIdByKey = new Map<string, string>();
    for (const milestone of seedCourse.milestones) {
      const upserted = await upsertMilestone(course.id, milestone);
      milestoneIdByKey.set(milestone.key, upserted.id);
    }

    for (const stage of seedCourse.stages) {
      const courseStage = await upsertStage(course.id, stage);
      for (const lesson of stage.lessons) {
        await upsertLesson(course.id, courseStage.id, lesson, milestoneIdByKey);
      }
    }
  }

  const now = new Date();
  const bundle = await upsertBundle({
    slug: SEED_BUNDLE.slug,
    title: SEED_BUNDLE.title,
    description: SEED_BUNDLE.description,
    type: SEED_BUNDLE.type,
    selectionCount: SEED_BUNDLE.selectionCount,
    price: SEED_BUNDLE.price,
    status: SEED_BUNDLE.status,
    startsAt: now,
    endsAt: new Date(now.getTime() + THIRTY_DAYS_MS),
  });

  for (const slug of SEED_BUNDLE.eligibleCourseSlugs) {
    const course = coursesBySlug.get(slug);
    if (!course) throw new Error(`Bundle "${SEED_BUNDLE.slug}" references unknown course slug "${slug}"`);
    await upsertBundleCourse(bundle.id, course.id);
  }

  return { courses: seededCourses, bundle };
}
