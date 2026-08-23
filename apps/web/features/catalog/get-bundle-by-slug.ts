import "server-only";
import { type Bundle, type Course, bundleCourses, bundles, courses, db, enrollments } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { courseOwnershipJoinCondition } from "./course-ownership-condition";

export type BundleCourseWithOwnership = Course & { alreadyOwned: boolean };
export type BundleDetail = Bundle & { courses: BundleCourseWithOwnership[] };

/**
 * Bundle detail lookup (CAT-005 detail view; COM-004/COM-005/COM-007 pointer —
 * checkout logic itself is a later phase). Returns the bundle regardless of its
 * status/campaign window: unlike a course, an INACTIVE/EXPIRED bundle still
 * needs to render on `/bundles/[slug]` to explain *why* it's not purchasable
 * (see SCREEN_INVENTORY.md Wave 3) rather than 404 like an unpublished course.
 *
 * `courses` is every included course for `FIXED`, or every eligible course for
 * `CHOOSE_N` — always the full list, never filtered by ownership. `alreadyOwned`
 * just annotates which of them the given user already holds (10.8), so the
 * caller can disable/exclude those from selection.
 */
export async function getBundleBySlug(slug: string, userId?: string): Promise<BundleDetail | null> {
  const [bundle] = await db.select().from(bundles).where(eq(bundles.slug, slug)).limit(1);
  if (!bundle) return null;

  const rows = await db
    .select({ course: courses, enrollmentId: enrollments.id })
    .from(bundleCourses)
    .innerJoin(courses, eq(bundleCourses.courseId, courses.id))
    .leftJoin(enrollments, courseOwnershipJoinCondition(userId))
    .where(eq(bundleCourses.bundleId, bundle.id));

  return {
    ...bundle,
    courses: rows.map(({ course, enrollmentId }) => ({
      ...course,
      alreadyOwned: enrollmentId !== null,
    })),
  };
}
