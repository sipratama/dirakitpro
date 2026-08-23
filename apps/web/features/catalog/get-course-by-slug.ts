import "server-only";
import { courses, db, enrollments } from "@dirakitpro/database";
import { and, eq } from "drizzle-orm";
import { courseOwnershipJoinCondition } from "./course-ownership-condition";
import type { CourseWithOwnership } from "./get-published-courses";

/**
 * Course detail lookup for the public catalog (CAT-002). Only a `PUBLISHED`
 * course resolves here (CAT-003) — DRAFT/UNPUBLISHED are treated as not-found,
 * since this function backs the public catalog page only. Whether a learner
 * who already enrolled keeps access after the course is later UNPUBLISHED is
 * the Learning domain's concern (LRN-006), not this lookup.
 *
 * `isOwned` follows the same ACTIVE/COMPLETED-enrollment rule as
 * getPublishedCourses (CAT-006).
 */
export async function getCourseBySlug(slug: string, userId?: string): Promise<CourseWithOwnership | null> {
  const rows = await db
    .select({ course: courses, enrollmentId: enrollments.id })
    .from(courses)
    .leftJoin(enrollments, courseOwnershipJoinCondition(userId))
    .where(and(eq(courses.slug, slug), eq(courses.status, "PUBLISHED")))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return { ...row.course, isOwned: row.enrollmentId !== null };
}
