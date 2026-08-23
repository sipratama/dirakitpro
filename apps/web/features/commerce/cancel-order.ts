import "server-only";
import { db, orders, type Order } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { OrderNotCancellableError, OrderOwnershipError } from "./errors";

/**
 * Cancels a PENDING order (10.1: PENDING → CANCELLED, an already-existing
 * transition — not a new state). Used by the "batalkan & pilih ulang" bundle
 * checkout flow (Fase 4) when `createBundleOrder` returns
 * `existing_order_selection_mismatch`. Ownership and non-existence report the
 * same error so a non-owner can't distinguish "not yours" from "doesn't exist".
 */
export async function cancelOrder(orderId: string, userId: string): Promise<Order> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.userId !== userId) {
    throw new OrderOwnershipError();
  }
  if (order.status !== "PENDING") {
    throw new OrderNotCancellableError();
  }

  const [cancelled] = await db
    .update(orders)
    .set({ status: "CANCELLED", cancelledAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();
  return cancelled;
}
