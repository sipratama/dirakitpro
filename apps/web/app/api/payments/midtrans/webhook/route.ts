import {
  processMidtransNotification,
  type MidtransNotificationPayload,
} from "@/features/commerce/process-payment-notification";
import { sendPaymentSuccessEmail } from "@/features/commerce/send-payment-success-email";
import { verifyMidtransSignature } from "@/features/commerce/verify-midtrans-signature";

function hasSignatureFields(
  payload: unknown,
): payload is MidtransNotificationPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as Record<string, unknown>).order_id === "string" &&
    typeof (payload as Record<string, unknown>).status_code === "string" &&
    typeof (payload as Record<string, unknown>).gross_amount === "string" &&
    typeof (payload as Record<string, unknown>).signature_key === "string" &&
    typeof (payload as Record<string, unknown>).transaction_status === "string"
  );
}

/**
 * Midtrans HTTP notification (COM-010). NOT gated by proxy.ts — authenticated
 * by signature verification, not a session (see proxy.ts's own comment).
 *
 * Order of operations is deliberate: (1) verify signature — reject BEFORE
 * touching the database or logging any payload detail beyond the order_id,
 * (2) process idempotently in one transaction, (3) only THEN, outside that
 * transaction, attempt the payment-success email — its failure is caught
 * here and must never turn into a non-200 response (NTF-002), since Midtrans
 * would otherwise retry a notification we already fully processed.
 */
export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!hasSignatureFields(payload) || !verifyMidtransSignature(payload)) {
    // Logged distinctly from generic application errors (15.6) — a rejected
    // signature is a commerce-security event. Never says WHY it was rejected.
    console.error("[midtrans-webhook] rejected notification with invalid/missing signature", {
      orderId: typeof (payload as { order_id?: unknown })?.order_id === "string" ? (payload as { order_id: string }).order_id : undefined,
    });
    return Response.json({ error: "Invalid signature" }, { status: 403 });
  }

  let result;
  try {
    result = await processMidtransNotification(payload);
  } catch (error) {
    console.error("[midtrans-webhook] failed to process notification", { orderId: payload.order_id, error });
    return Response.json({ error: "Failed to process notification" }, { status: 500 });
  }

  if (result.kind === "order_not_found") {
    console.error("[midtrans-webhook] notification for unknown order", { orderId: payload.order_id });
  }

  if (result.kind === "paid") {
    try {
      await sendPaymentSuccessEmail(result.order.userId, result.grantedCourseIds);
    } catch (error) {
      console.error("[midtrans-webhook] payment-success email failed to send", {
        orderId: result.order.id,
        error,
      });
    }
  }

  return Response.json({ status: "ok" });
}
