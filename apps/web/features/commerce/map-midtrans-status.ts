import type { Payment } from "@dirakitpro/database";

export type NormalizedPaymentStatus = Payment["normalizedStatus"];

export class UnrecognizedMidtransStatusError extends Error {
  constructor(transactionStatus: string) {
    super(`Unrecognized Midtrans transaction_status: "${transactionStatus}"`);
    this.name = "UnrecognizedMidtransStatusError";
  }
}

/**
 * Maps a Midtrans notification's `transaction_status`/`fraud_status` to this
 * domain's normalized Payment status (10.2): settlement/capture → PAID,
 * pending → PENDING, deny/cancel → FAILED, expire → EXPIRED. `capture` is
 * credit-card-specific and additionally gated on `fraud_status` (per
 * midtrans-client's own documented handling): only `accept` counts as PAID;
 * `challenge` holds as PENDING pending manual fraud review; anything else
 * (e.g. `deny`) is FAILED. `refund`/`partial_refund` are deliberately NOT
 * mapped here — COM-013 keeps REFUNDED an admin-manual transition for MVP,
 * not webhook-driven.
 */
export function mapMidtransStatus(transactionStatus: string, fraudStatus?: string | null): NormalizedPaymentStatus {
  switch (transactionStatus) {
    case "capture":
      if (fraudStatus === "accept") return "PAID";
      if (fraudStatus === "challenge") return "PENDING";
      return "FAILED";
    case "settlement":
      return "PAID";
    case "pending":
      return "PENDING";
    case "deny":
    case "cancel":
      return "FAILED";
    case "expire":
      return "EXPIRED";
    default:
      throw new UnrecognizedMidtransStatusError(transactionStatus);
  }
}
