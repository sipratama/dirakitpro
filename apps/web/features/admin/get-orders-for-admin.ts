import "server-only";
import { db, orderItems, orders, users, type Order } from "@dirakitpro/database";
import { desc, inArray } from "drizzle-orm";

export type AdminOrderSummary = Order & { itemTitle: string; userEmail: string; username: string };

/**
 * Read-only commerce view for `/admin/orders` (ADM-006) — every order across
 * every user. Item title comes from the immutable `OrderItem` snapshot, the
 * same source `/account/orders` (`getOrdersForUser`) already uses, not a live
 * join to courses/bundles that could drift from what was actually purchased.
 */
export async function getOrdersForAdmin(): Promise<AdminOrderSummary[]> {
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  if (allOrders.length === 0) return [];

  const orderIds = allOrders.map((order) => order.id);
  const items = await db
    .select({ orderId: orderItems.orderId, itemTitle: orderItems.itemTitle })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));
  const itemTitleByOrderId = new Map(items.map((item) => [item.orderId, item.itemTitle]));

  const userIds = [...new Set(allOrders.map((order) => order.userId))];
  const userRows = await db
    .select({ id: users.id, email: users.email, username: users.username })
    .from(users)
    .where(inArray(users.id, userIds));
  const userById = new Map(userRows.map((user) => [user.id, user]));

  return allOrders.map((order) => ({
    ...order,
    itemTitle: itemTitleByOrderId.get(order.id) ?? "",
    userEmail: userById.get(order.userId)?.email ?? "",
    username: userById.get(order.userId)?.username ?? "",
  }));
}
