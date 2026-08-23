// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

// Renders nothing itself, but fires onReady immediately — real Snap.js
// loading isn't what this test verifies; the click -> window.snap.pay wiring
// and the four callbacks each routing to /payment/[orderId] is.
vi.mock("next/script", () => ({
  default: ({ onReady }: { onReady?: () => void }) => {
    onReady?.();
    return null;
  },
}));

const { SnapCheckout } = await import("./snap-checkout");

describe("SnapCheckout", () => {
  const mockPay = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.snap = { pay: mockPay };
  });

  it("calls window.snap.pay with the given token once the script is ready", () => {
    render(<SnapCheckout token="snap-token-abc" orderId="order-1" clientKey="client-key" isProduction={false} />);

    const button = screen.getByRole("button", { name: "Bayar sekarang" });
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    expect(mockPay).toHaveBeenCalledTimes(1);
    expect(mockPay.mock.calls[0]![0]).toBe("snap-token-abc");
  });

  it("routes every Snap callback to /payment/[orderId] rather than declaring success/failure itself (COM-010)", () => {
    render(<SnapCheckout token="snap-token-abc" orderId="order-42" clientKey="client-key" isProduction={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Bayar sekarang" }));

    const options = mockPay.mock.calls[0]![1] as Record<string, () => void>;
    for (const callback of ["onSuccess", "onPending", "onError", "onClose"]) {
      mockPush.mockClear();
      options[callback]!();
      expect(mockPush).toHaveBeenCalledWith("/payment/order-42");
    }
  });
});
