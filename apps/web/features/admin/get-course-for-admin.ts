import "server-only";
import { courses, db, type Course } from "@dirakitpro/database";
import { eq } from "drizzle-orm";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Single-course lookup for `/admin/courses/[courseId]` — same UUID-validate-first guard as getProjectForModeration, so a malformed id resolves to `null` (404) instead of a raw Postgres error. */
export async function getCourseForAdmin(courseId: string): Promise<Course | null> {
  if (!UUID_PATTERN.test(courseId)) return null;

  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  return course ?? null;
}
