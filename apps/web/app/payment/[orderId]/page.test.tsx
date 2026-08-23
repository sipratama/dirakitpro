// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockGetOrderForOwner = vi.hoisted(() => vi.fn());
const mockNotFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
);
const mockRedirect = vi.hoisted(() =>
  vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
);

vi.mock("@dirakitpro/auth", () => ({ getCurrentUser: mockGetCurrentUser }));
vi.mock("@/features/commerce/get-order-for-owner", () => ({ getOrderForOwner: mockGetOrderForOwner }));
vi.mock("next/navigation", () => ({ notFound: mockNotFound, redirect: mockRedirect }));

const { default: PaymentStatusPage } = await import("./page");

function callPage(orderId: string) {
  return PaymentStatusPage({ params: Promise.resolve({ orderId }), searchParams: Promise.resolve({}) });
}

function baseOrder(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "order-1",
    status: "PENDING",
    totalAmount: "149000.00",
    sourceType: "DIRECT_COURSE",
    sourceSlug: "rakit-aplikasi-keuangan-pribadi",
    grantedCourses: [],
    ...overrides,
  };
}

describe("PaymentStatusPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
  });

  it("404s when the order does not belong to the current user (ownership check never leaks existence)", async () => {
    mockGetOrderForOwner.mockResolvedValue(null);

    await expect(callPage("order-not-mine")).rejects.toThrow("NOT_FOUND");
  });

  it("shows a PENDING message that does not claim success (COM-010)", async () => {
    mockGetOrderForOwner.mockResolvedValue(baseOrder({ status: "PENDING" }));

    render(await callPage("order-1"));

    expect(screen.getByText(/sedang diproses/)).toBeInTheDocument();
    expect(screen.queryByText("Pembayaran berhasil! Course berikut sudah aktif di akunmu:")).not.toBeInTheDocument();
  });

  it("shows the granted courses and a dashboard CTA for a PAID order", async () => {
    mockGetOrderForOwner.mockResolvedValue(
      baseOrder({ status: "PAID", grantedCourses: [{ courseId: "c1", title: "Rakit Aplikasi Keuangan Pribadi" }] }),
    );

    render(await callPage("order-1"));

    expect(screen.getByText("Pembayaran berhasil! Course berikut sudah aktif di akunmu:")).toBeInTheDocument();
    expect(screen.getByText("Rakit Aplikasi Keuangan Pribadi")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ke dashboard" })).toHaveAttribute("href", "/dashboard");
  });

  it("shows an EXPIRED message with a CTA back to the course", async () => {
    mockGetOrderForOwner.mockResolvedValue(baseOrder({ status: "EXPIRED" }));

    render(await callPage("order-1"));

    expect(screen.getByText(/sudah habis/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Coba lagi" })).toHaveAttribute(
      "href",
      "/courses/rakit-aplikasi-keuangan-pribadi",
    );
  });

  it("shows a CANCELLED message with a CTA back to the bundle for a bundle order", async () => {
    mockGetOrderForOwner.mockResolvedValue(
      baseOrder({ status: "CANCELLED", sourceType: "BUNDLE", sourceSlug: "paket-merdeka" }),
    );

    render(await callPage("order-1"));

    expect(screen.getByText(/sudah dibatalkan/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Coba lagi" })).toHaveAttribute("href", "/bundles/paket-merdeka");
  });
});
