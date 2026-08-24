import "server-only";
import { bundles, courses, db, orderCourseGrants, orders, type Order } from "@dirakitpro/database";
import { eq } from "drizzle-orm";

export type OrderWithDetail = Order & {
  grantedCourses: { courseId: string; title: string }[];
  // Course slug (DIRECT_COURSE) or bundle slug (BUNDLE) to go "back to the
  // course/bundle" for a retry checkout (EXPIRED/CANCELLED state) — null if
  // the source row is somehow gone (defensive; rows are never hard-deleted).
  sourceSlug: string | null;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Ownership-checked order lookup for `/payment/[orderId]` (COM-010's "don't
 * claim success just because the browser is on this page" applies to state
 * display, not to who can SEE it — that's this check). Returns null both
 * when the order doesn't exist and when it belongs to someone else, so a
 * caller can't distinguish the two (PRD 16: never leak that an order exists
 * to a non-owner) — same principle as cancelOrder's OrderOwnershipError.
 *
 * `orderId` comes straight from a URL param, so it's validated as a
 * well-formed UUID before hitting the DB — an arbitrary string would
 * otherwise reach Postgres as an invalid `uuid` literal and 500 instead of
 * cleanly not-found.
 */
export async function getOrderForOwner(orderId: string, userId: string): Promise<OrderWithDetail | null> {
  if (!UUID_PATTERN.test(orderId)) return null;

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.userId !== userId) return null;

  const grants = await db
    .select({ courseId: orderCourseGrants.courseId, title: orderCourseGrants.courseTitleSnapshot })
    .from(orderCourseGrants)
    .where(eq(orderCourseGrants.orderId, order.id));

  let sourceSlug: string | null = null;
  if (order.sourceType === "DIRECT_COURSE" && order.courseId) {
    const [course] = await db.select({ slug: courses.slug }).from(courses).where(eq(courses.id, order.courseId)).limit(1);
    sourceSlug = course?.slug ?? null;
  } else if (order.sourceType === "BUNDLE" && order.bundleId) {
    const [bundle] = await db.select({ slug: bundles.slug }).from(bundles).where(eq(bundles.id, order.bundleId)).limit(1);
    sourceSlug = bundle?.slug ?? null;
  }

  return { ...order, grantedCourses: grants, sourceSlug };
}
