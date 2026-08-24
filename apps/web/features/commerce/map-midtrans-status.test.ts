import { describe, expect, it } from "vitest";
import { mapMidtransStatus, UnrecognizedMidtransStatusError } from "./map-midtrans-status";

describe("mapMidtransStatus", () => {
  it.each([
    ["settlement", undefined, "PAID"],
    ["pending", undefined, "PENDING"],
    ["deny", undefined, "FAILED"],
    ["cancel", undefined, "FAILED"],
    ["expire", undefined, "EXPIRED"],
    ["capture", "accept", "PAID"],
    ["capture", "challenge", "PENDING"],
    ["capture", "deny", "FAILED"],
    ["capture", undefined, "FAILED"],
  ] as const)("maps transaction_status=%s fraud_status=%s to %s (10.2)", (transactionStatus, fraudStatus, expected) => {
    expect(mapMidtransStatus(transactionStatus, fraudStatus)).toBe(expected);
  });

  it("throws for an unrecognized transaction_status rather than silently defaulting", () => {
    expect(() => mapMidtransStatus("some_future_status_midtrans_might_add")).toThrow(UnrecognizedMidtransStatusError);
  });
});
