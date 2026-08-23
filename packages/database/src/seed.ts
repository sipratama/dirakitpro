import { and, eq } from "drizzle-orm";
import { db } from "./client";
import {
  bundleCourses,
  bundles,
  courses,
  courseStages,
  lessons,
  type Bundle,
  type Course,
  type CourseStage,
  type Lesson,
  type NewBundle,
  type NewCourse,
} from "./schema";

type SeedLesson = { slug: string; title: string; type: Lesson["type"]; position: number };
type SeedStage = { title: string; position: number; lessons: SeedLesson[] };
type SeedCourse = Omit<NewCourse, "status" | "publishedAt"> & { stages: SeedStage[] };

// Appendix A — Initial MVP Course Lineup (locked). Stage names come from 9.4
// "Example stage language", picked per course based on what that course
// actually builds (e.g. a static personal site has no "Make It Remember"
// stage; the finance/booking apps do).
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
    stages: [
      {
        title: "Make It Visible",
        position: 1,
        lessons: [
          { slug: "kenalan-html-css", title: "Kenalan dengan HTML & CSS", type: "CONCEPT", position: 1 },
          { slug: "bangun-halaman-personal-pertama", title: "Bangun halaman personal pertama", type: "BUILD", position: 2 },
        ],
      },
      {
        title: "Make It Interactive",
        position: 2,
        lessons: [
          { slug: "interaksi-dasar-javascript", title: "Interaksi dasar dengan JavaScript", type: "DEMO", position: 1 },
          { slug: "rakit-navigasi-responsive", title: "Rakit navigasi responsive", type: "BUILD", position: 2 },
        ],
      },
      {
        title: "Put It Online",
        position: 3,
        lessons: [{ slug: "deploy-website-ke-hosting", title: "Deploy website ke hosting", type: "DEPLOY", position: 1 }],
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
    stages: [
      {
        title: "Make It Visible",
        position: 1,
        lessons: [
          { slug: "rancang-dashboard-keuangan", title: "Rancang dashboard keuangan", type: "CONCEPT", position: 1 },
          { slug: "bangun-tampilan-dashboard", title: "Bangun tampilan dashboard", type: "BUILD", position: 2 },
        ],
      },
      {
        title: "Make It Remember",
        position: 2,
        lessons: [
          { slug: "setup-database-transaksi", title: "Setup database transaksi", type: "DEMO", position: 1 },
          { slug: "simpan-data-transaksi", title: "Simpan data transaksi", type: "BUILD", position: 2 },
        ],
      },
      {
        title: "Make It Personal",
        position: 3,
        lessons: [
          { slug: "autentikasi-dan-personalisasi", title: "Autentikasi & personalisasi data", type: "CONCEPT", position: 1 },
          { slug: "rakit-login-user", title: "Rakit login user", type: "BUILD", position: 2 },
        ],
      },
      {
        title: "Put It Online",
        position: 4,
        lessons: [{ slug: "deploy-aplikasi-keuangan", title: "Deploy aplikasi keuangan", type: "DEPLOY", position: 1 }],
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
    stages: [
      {
        title: "Make It Visible",
        position: 1,
        lessons: [
          { slug: "rancang-alur-booking", title: "Rancang alur booking", type: "CONCEPT", position: 1 },
          { slug: "bangun-halaman-booking", title: "Bangun halaman booking", type: "BUILD", position: 2 },
        ],
      },
      {
        title: "Make It Remember",
        position: 2,
        lessons: [
          { slug: "simpan-data-booking-customer", title: "Simpan data booking & customer", type: "BUILD", position: 1 },
          { slug: "kelola-status-booking", title: "Kelola status booking", type: "DEMO", position: 2 },
        ],
      },
      {
        title: "Make It Useful",
        position: 3,
        lessons: [
          { slug: "bangun-admin-view", title: "Bangun admin view", type: "CONCEPT", position: 1 },
          { slug: "rakit-dashboard-admin-booking", title: "Rakit dashboard admin booking", type: "BUILD", position: 2 },
        ],
      },
      {
        title: "Put It Online",
        position: 4,
        lessons: [{ slug: "deploy-sistem-booking", title: "Deploy sistem booking", type: "DEPLOY", position: 1 }],
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

async function upsertCourse(input: SeedCourse): Promise<Course> {
  const { stages, ...courseFields } = input;
  const [inserted] = await db
    .insert(courses)
    .values({ ...courseFields, status: "PUBLISHED", publishedAt: new Date() })
    .onConflictDoNothing({ target: courses.slug })
    .returning();
  if (inserted) return inserted;

  const [existing] = await db.select().from(courses).where(eq(courses.slug, input.slug)).limit(1);
  if (!existing) throw new Error(`Failed to upsert course "${input.slug}"`);
  return existing;
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

async function upsertLesson(courseId: string, courseStageId: string, lesson: SeedLesson): Promise<Lesson> {
  const [inserted] = await db
    .insert(lessons)
    .values({
      courseId,
      courseStageId,
      slug: lesson.slug,
      title: lesson.title,
      type: lesson.type,
      position: lesson.position,
      content: { blocks: [{ type: "text", body: `Ringkasan materi: ${lesson.title}.` }] },
    })
    .onConflictDoNothing({ target: [lessons.courseId, lessons.slug] })
    .returning();
  if (inserted) return inserted;

  const [existing] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.courseId, courseId), eq(lessons.slug, lesson.slug)))
    .limit(1);
  if (!existing) throw new Error(`Failed to upsert lesson "${lesson.slug}" for course ${courseId}`);
  return existing;
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
 * campaign, 9.4 stage language). Safe to run repeatedly — every insert is
 * conflict-checked against its slug/position/composite unique index first, so
 * a second run updates nothing and creates nothing new.
 */
export async function seed(): Promise<SeedResult> {
  const seededCourses: Course[] = [];
  const coursesBySlug = new Map<string, Course>();

  for (const seedCourse of SEED_COURSES) {
    const course = await upsertCourse(seedCourse);
    seededCourses.push(course);
    coursesBySlug.set(course.slug, course);

    for (const stage of seedCourse.stages) {
      const courseStage = await upsertStage(course.id, stage);
      for (const lesson of stage.lessons) {
        await upsertLesson(course.id, courseStage.id, lesson);
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
