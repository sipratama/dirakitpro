import "server-only";
import { bundleCourses, db, enrollments } from "@dirakitpro/database";
import { and, eq, inArray } from "drizzle-orm";

/**
 * Counts how many of a bundle's eligible courses the given learner does NOT
 * already own. Compare the result against the bundle's `selectionCount` (N,
 * `CHOOSE_N` only) to decide whether the bundle can be bought by this learner
 * at all — per 10.8, a learner with fewer than N eligible unowned courses
 * cannot purchase the bundle, even while the bundle itself is ACTIVE.
 */
export async function getBundleEligibleCount(bundleId: string, userId: string): Promise<number> {
  const rows = await db
    .select({ courseId: bundleCourses.courseId, enrollmentId: enrollments.id })
    .from(bundleCourses)
    .leftJoin(
      enrollments,
      and(
        eq(enrollments.courseId, bundleCourses.courseId),
        eq(enrollments.userId, userId),
        inArray(enrollments.status, ["ACTIVE", "COMPLETED"]),
      ),
    )
    .where(eq(bundleCourses.bundleId, bundleId));

  return rows.filter((row) => row.enrollmentId === null).length;
}
