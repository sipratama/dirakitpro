import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

export type MidtransSignaturePayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
};

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Verifies a Midtrans HTTP notification signature (COM-010, PRD 16) — the
 * mandatory gate before processing any webhook payload. Formula confirmed
 * live against https://docs.midtrans.com/docs/https-notification-webhooks
 * (fetched at implementation time, not assumed from training data):
 *
 *   signature_key == SHA512(order_id + status_code + gross_amount + ServerKey)
 *
 * `gross_amount` must be the EXACT string Midtrans sent (e.g. "149000.00",
 * confirmed via a live sample notification body on the same docs site) — the
 * hash is byte-sensitive, so it must not be reformatted/re-parsed as a number
 * before hashing.
 */
export function verifyMidtransSignature(payload: MidtransSignaturePayload): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY is not configured.");
  }

  const expected = createHash("sha512")
    .update(payload.order_id + payload.status_code + payload.gross_amount + serverKey)
    .digest("hex");

  return safeCompare(expected, payload.signature_key);
}
