import "server-only";
import { db, orderCourseGrants, orderItems, orders, type Order } from "@dirakitpro/database";
import { desc, eq, inArray } from "drizzle-orm";

export type OrderSummary = Order & { itemTitle: string; grantedCourseTitles: string[] };

/**
 * A learner's own order history (COM-012): direct-course and bundle orders,
 * status, nominal, and the courses obtained — most recent first. Titles come
 * from the immutable OrderItem/OrderCourseGrant snapshots (COM-002/COM-008),
 * not from a live join to courses/bundles, so a historical order still shows
 * the title as it was at purchase time even if the course/bundle was
 * retitled since.
 */
export async function getOrdersForUser(userId: string): Promise<OrderSummary[]> {
  const userOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  if (userOrders.length === 0) return [];

  const orderIds = userOrders.map((order) => order.id);

  const items = await db
    .select({ orderId: orderItems.orderId, itemTitle: orderItems.itemTitle })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));
  const itemTitleByOrderId = new Map(items.map((item) => [item.orderId, item.itemTitle]));

  const grants = await db
    .select({ orderId: orderCourseGrants.orderId, title: orderCourseGrants.courseTitleSnapshot })
    .from(orderCourseGrants)
    .where(inArray(orderCourseGrants.orderId, orderIds));
  const grantedTitlesByOrderId = new Map<string, string[]>();
  for (const grant of grants) {
    const titles = grantedTitlesByOrderId.get(grant.orderId) ?? [];
    titles.push(grant.title);
    grantedTitlesByOrderId.set(grant.orderId, titles);
  }

  return userOrders.map((order) => ({
    ...order,
    itemTitle: itemTitleByOrderId.get(order.id) ?? "",
    grantedCourseTitles: grantedTitlesByOrderId.get(order.id) ?? [],
  }));
}
