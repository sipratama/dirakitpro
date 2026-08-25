import "server-only";
import { bundleCourses, bundles, db, type Bundle } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { BundleNotFoundError } from "./errors";

export type SetBundleEligibleCoursesResult = { bundle: Bundle; warning: string | null };

/**
 * Replaces `bundleCourses` wholesale (COM-004/COM-005/COM-007) — the admin
 * form submits the full desired set each time, so delete-then-insert inside
 * one transaction is simpler and just as correct as diffing.
 *
 * If CHOOSE_N and the given set ends up smaller than `selectionCount`, the
 * save still succeeds with a `warning` instead of a hard reject — a bundle
 * like this has no rule against it, it just will never be purchasable until
 * the admin adds more eligible courses, and that's the admin's call to make.
 */
export async function setBundleEligibleCourses(bundleId: string, courseIds: string[]): Promise<SetBundleEligibleCoursesResult> {
  return db.transaction(async (tx) => {
    const [bundle] = await tx.select().from(bundles).where(eq(bundles.id, bundleId)).limit(1);
    if (!bundle) throw new BundleNotFoundError();

    await tx.delete(bundleCourses).where(eq(bundleCourses.bundleId, bundleId));
    if (courseIds.length > 0) {
      await tx.insert(bundleCourses).values(courseIds.map((courseId) => ({ bundleId, courseId })));
    }

    const warning =
      bundle.type === "CHOOSE_N" && bundle.selectionCount !== null && courseIds.length < bundle.selectionCount
        ? `Hanya ${courseIds.length} course eligible, kurang dari selectionCount (${bundle.selectionCount}). Bundle ini belum akan purchasable sampai eligible course ditambah.`
        : null;

    return { bundle, warning };
  });
}
