import "server-only";
import { courses, db, enrollments, type Course, type Enrollment } from "@dirakitpro/database";
import { and, eq, inArray } from "drizzle-orm";

export type EnrollmentAccess = { course: Course; enrollment: Enrollment };

/**
 * Access guard for the learning workspace (LEARNING_WORKSPACE.md §2/§3.4).
 * Looks up the course by slug directly — NOT via catalog's `getCourseBySlug`,
 * which filters to `PUBLISHED` only — because LRN-006 requires an already-
 * enrolled learner to keep full access even after the course is later
 * UNPUBLISHED. Returns null when the course doesn't exist or the caller has
 * no ACTIVE/COMPLETED Enrollment for it; both cases redirect to
 * `/courses/[slug]` at the call site, never a 404 (the course does exist —
 * the honest state is "you haven't bought this").
 */
export async function getEnrollmentAccess(userId: string, courseSlug: string): Promise<EnrollmentAccess | null> {
  const [course] = await db.select().from(courses).where(eq(courses.slug, courseSlug)).limit(1);
  if (!course) return null;

  const [enrollment] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, course.id),
        inArray(enrollments.status, ["ACTIVE", "COMPLETED"]),
      ),
    )
    .limit(1);
  if (!enrollment) return null;

  return { course, enrollment };
}
