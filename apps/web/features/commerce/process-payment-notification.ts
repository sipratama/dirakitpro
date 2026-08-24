import "server-only";
import { db, orderCourseGrants, orders, payments, type Order } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { grantEnrollment } from "./grant-enrollment";
import { mapMidtransStatus } from "./map-midtrans-status";

export type MidtransNotificationPayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  transaction_id?: string;
} & Record<string, unknown>;

export type ProcessNotificationResult =
  | { kind: "order_not_found" }
  | { kind: "no_transition" }
  | { kind: "paid"; order: Order; grantedCourseIds: string[] }
  | { kind: "cancelled"; order: Order }
  | { kind: "expired"; order: Order };

/**
 * Authoritative, idempotent processing of an ALREADY signature-verified
 * Midtrans notification (COM-010, COM-011, 10.1, 10.2). Callers MUST call
 * `verifyMidtransSignature()` first and only invoke this on success — this
 * function does not re-check the signature itself.
 *
 * Idempotency is the single most important property here. Inside one
 * transaction: the Payment row is read `FOR UPDATE` first — this both
 * establishes the current status and, via the row lock, serializes any
 * concurrent notification for the SAME payment (e.g. Midtrans retrying the
 * identical webhook) so the second call always observes the first call's
 * already-committed result rather than racing it.
 *
 * If the Payment is already in a terminal normalizedStatus (anything but
 * PENDING) — or the new notification itself only reports PENDING — this is
 * NOT a new transition: raw fields are updated for audit, but no side effect
 * (grant, email trigger, Order mutation) runs. Enrollment is granted via
 * `grantEnrollment()`, passed this same `tx` so the grant commits/rolls back
 * atomically with the Order/Payment update (COM-011, 15.2).
 *
 * PENDING → CANCELLED for a denied/cancelled payment reuses the existing
 * 10.1 transition (there is no separate Order "FAILED" state) — confirmed
 * with the product owner as the intended interpretation of "system cancels
 * before settlement" for this case.
 */
export async function processMidtransNotification(
  payload: MidtransNotificationPayload,
): Promise<ProcessNotificationResult> {
  const normalizedStatus = mapMidtransStatus(payload.transaction_status, payload.fraud_status);

  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, payload.order_id)).for("update").limit(1);
    if (!order) return { kind: "order_not_found" };

    const [payment] = await tx.select().from(payments).where(eq(payments.orderId, order.id)).for("update").limit(1);
    if (!payment) return { kind: "order_not_found" };

    const alreadyTerminal = payment.normalizedStatus !== "PENDING";
    if (alreadyTerminal || normalizedStatus === "PENDING") {
      await tx
        .update(payments)
        .set({ rawStatus: payload.transaction_status, rawPayload: payload })
        .where(eq(payments.id, payment.id));
      return { kind: "no_transition" };
    }

    // payment.normalizedStatus === "PENDING" and normalizedStatus is
    // PAID/FAILED/EXPIRED here: a genuine new transition.
    await tx
      .update(payments)
      .set({
        normalizedStatus,
        rawStatus: payload.transaction_status,
        rawPayload: payload,
        providerTransactionId: payload.transaction_id ?? payment.providerTransactionId,
        paidAt: normalizedStatus === "PAID" ? new Date() : payment.paidAt,
      })
      .where(eq(payments.id, payment.id));

    if (normalizedStatus === "PAID") {
      const [paidOrder] = await tx
        .update(orders)
        .set({ status: "PAID", paidAt: new Date() })
        .where(eq(orders.id, order.id))
        .returning();

      const grants = await tx.select().from(orderCourseGrants).where(eq(orderCourseGrants.orderId, order.id));
      const grantedCourseIds: string[] = [];
      for (const grant of grants) {
        await grantEnrollment(order.userId, grant.courseId, tx);
        grantedCourseIds.push(grant.courseId);
      }
      return { kind: "paid", order: paidOrder!, grantedCourseIds };
    }

    if (normalizedStatus === "EXPIRED") {
      const [expiredOrder] = await tx.update(orders).set({ status: "EXPIRED" }).where(eq(orders.id, order.id)).returning();
      return { kind: "expired", order: expiredOrder! };
    }

    // normalizedStatus === "FAILED"
    const [cancelledOrder] = await tx
      .update(orders)
      .set({ status: "CANCELLED", cancelledAt: new Date() })
      .where(eq(orders.id, order.id))
      .returning();
    return { kind: "cancelled", order: cancelledOrder! };
  });
}
