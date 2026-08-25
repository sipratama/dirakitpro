import "server-only";
import { bundleCourses, bundles, courses, db, type Bundle, type Course } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { expireBundle } from "./expire-bundle";
import { isCampaignWindowValid } from "./is-campaign-window-valid";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BundleForAdmin = Bundle & { eligibleCourses: Course[] };

/**
 * Single-bundle lookup for `/admin/bundles/[bundleId]` — same UUID-validate-
 * first guard as getCourseForAdmin, and the same ACTIVE -> EXPIRED self-heal
 * as getBundlesForAdmin (see that file's comment for why).
 */
export async function getBundleForAdmin(bundleId: string): Promise<BundleForAdmin | null> {
  if (!UUID_PATTERN.test(bundleId)) return null;

  let [bundle] = await db.select().from(bundles).where(eq(bundles.id, bundleId)).limit(1);
  if (!bundle) return null;

  if (bundle.status === "ACTIVE" && !isCampaignWindowValid(bundle)) {
    bundle = await expireBundle(bundle.id);
  }

  const rows = await db
    .select({ course: courses })
    .from(bundleCourses)
    .innerJoin(courses, eq(bundleCourses.courseId, courses.id))
    .where(eq(bundleCourses.bundleId, bundleId));

  return { ...bundle, eligibleCourses: rows.map((row) => row.course) };
}
