import "server-only";
import { db, orderItems, orders, payments, users, type Order } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import midtransClient, { type Snap } from "midtrans-client";
import { OrderNotPayableError } from "./errors";

/**
 * Constructs a Midtrans Snap client from server-only env vars (PRD 16 — the
 * server key never leaves this function, and is never part of this module's
 * return value). Built fresh per call rather than module-level singleton so a
 * missing/rotated key surfaces immediately instead of being cached.
 */
function createSnapClient(): Snap {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.MIDTRANS_CLIENT_KEY;
  if (!serverKey || !clientKey) {
    throw new Error("MIDTRANS_SERVER_KEY/MIDTRANS_CLIENT_KEY is not configured.");
  }

  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey,
    clientKey,
  });
}

/**
 * One Payment row anchors every Snap attempt for this Order (create on first
 * call, otherwise leave it — the Order is still PENDING here so the Payment
 * can't have moved past PENDING either). `providerTransactionId` stays null:
 * Snap's `createTransaction` response only returns `token`/`redirect_url` —
 * Midtrans only assigns a `transaction_id` once the buyer picks a payment
 * method, which arrives later via the webhook (Fase 3).
 */
async function ensurePendingPayment(order: Order): Promise<void> {
  const [existing] = await db.select({ id: payments.id }).from(payments).where(eq(payments.orderId, order.id)).limit(1);
  if (existing) return;

  await db.insert(payments).values({
    orderId: order.id,
    provider: "MIDTRANS",
    normalizedStatus: "PENDING",
    amount: order.totalAmount,
    currency: order.currency,
  });
}

/**
 * Creates a fresh Midtrans Snap transaction token for a PENDING Order
 * (COM-009). Always requests a brand-new token — never caches/reuses one —
 * because the Snap transaction is tied to this Order's own id as `order_id`,
 * so re-requesting for the same order is safe on Midtrans's side and avoids
 * ever handing back a token that may have already expired there.
 */
export async function createSnapToken(orderId: string): Promise<string> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.status !== "PENDING" || order.expiresAt <= new Date()) {
    throw new OrderNotPayableError();
  }

  const [buyer] = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
  if (!buyer) {
    throw new Error(`Order ${orderId} references a user that no longer exists.`);
  }
  const [item] = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).limit(1);
  if (!item) {
    throw new Error(`Order ${orderId} has no OrderItem snapshot.`);
  }

  await ensurePendingPayment(order);

  const snap = createSnapClient();
  const grossAmount = Math.round(Number(order.totalAmount));
  const transaction = await snap.createTransaction({
    transaction_details: {
      order_id: order.id,
      gross_amount: grossAmount,
    },
    item_details: [
      {
        id: item.courseId ?? item.bundleId,
        price: grossAmount,
        quantity: 1,
        name: item.itemTitle,
      },
    ],
    customer_details: {
      email: buyer.email,
      first_name: buyer.displayName,
    },
  });

  return transaction.token;
}
