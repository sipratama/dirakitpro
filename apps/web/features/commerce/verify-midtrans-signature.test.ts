import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { verifyMidtransSignature } from "./verify-midtrans-signature";

const SERVER_KEY = "SB-Mid-server-test-key";

function signaturePayload(overrides: Partial<{ order_id: string; status_code: string; gross_amount: string }> = {}) {
  const order_id = overrides.order_id ?? "order-123";
  const status_code = overrides.status_code ?? "200";
  const gross_amount = overrides.gross_amount ?? "149000.00";
  const signature_key = createHash("sha512").update(order_id + status_code + gross_amount + SERVER_KEY).digest("hex");
  return { order_id, status_code, gross_amount, signature_key };
}

describe("verifyMidtransSignature", () => {
  const originalServerKey = process.env.MIDTRANS_SERVER_KEY;

  beforeEach(() => {
    process.env.MIDTRANS_SERVER_KEY = SERVER_KEY;
  });

  afterEach(() => {
    process.env.MIDTRANS_SERVER_KEY = originalServerKey;
  });

  it("accepts a signature computed as SHA512(order_id + status_code + gross_amount + ServerKey)", () => {
    expect(verifyMidtransSignature(signaturePayload())).toBe(true);
  });

  it("rejects a tampered gross_amount even if signature_key is unchanged", () => {
    const valid = signaturePayload();
    expect(verifyMidtransSignature({ ...valid, gross_amount: "999000.00" })).toBe(false);
  });

  it("rejects a tampered order_id even if signature_key is unchanged", () => {
    const valid = signaturePayload();
    expect(verifyMidtransSignature({ ...valid, order_id: "order-999" })).toBe(false);
  });

  it("rejects an outright garbage signature_key", () => {
    const valid = signaturePayload();
    expect(verifyMidtransSignature({ ...valid, signature_key: "not-a-real-signature" })).toBe(false);
  });

  it("throws if MIDTRANS_SERVER_KEY is not configured", () => {
    delete process.env.MIDTRANS_SERVER_KEY;
    expect(() => verifyMidtransSignature(signaturePayload())).toThrow();
  });
});
