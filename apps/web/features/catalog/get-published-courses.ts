import "server-only";
import { type Course, courses, db, enrollments } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { courseOwnershipJoinCondition } from "./course-ownership-condition";

export type CourseWithOwnership = Course & { isOwned: boolean };

/**
 * Course catalog listing (CAT-001). Only `status = PUBLISHED` courses are
 * discoverable here (CAT-003) — DRAFT/UNPUBLISHED never appear regardless of
 * caller. FREE courses (price = 0, CAT-004) need no special handling — they
 * pass through this filter like any other published course.
 *
 * When `userId` is given, `isOwned` reflects an ACTIVE/COMPLETED enrollment for
 * that course (CAT-006) via a single left join — not a per-course lookup.
 * It's a UX aid only; purchase-time enforcement is COM-016, not this flag.
 */
export async function getPublishedCourses(userId?: string): Promise<CourseWithOwnership[]> {
  const rows = await db
    .select({ course: courses, enrollmentId: enrollments.id })
    .from(courses)
    .leftJoin(enrollments, courseOwnershipJoinCondition(userId))
    .where(eq(courses.status, "PUBLISHED"));

  return rows.map(({ course, enrollmentId }) => ({
    ...course,
    isOwned: enrollmentId !== null,
  }));
}
