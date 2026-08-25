// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetOrdersForAdmin = vi.hoisted(() => vi.fn());

vi.mock("@/features/admin/get-orders-for-admin", () => ({ getOrdersForAdmin: mockGetOrdersForAdmin }));

const { default: AdminOrdersPage } = await import("./page");

describe("AdminOrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an empty message when there are no orders", async () => {
    mockGetOrdersForAdmin.mockResolvedValue([]);

    render(await AdminOrdersPage());

    expect(screen.getByText("Belum ada order.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders a table row per order with user, item, amount, status, and date", async () => {
    mockGetOrdersForAdmin.mockResolvedValue([
      {
        id: "o1",
        userEmail: "learner@example.com",
        itemTitle: "Rakit Aplikasi Keuangan Pribadi",
        totalAmount: "149000.00",
        status: "PAID",
        createdAt: new Date("2026-01-15"),
      },
    ]);

    render(await AdminOrdersPage());

    expect(screen.getByText("learner@example.com")).toBeInTheDocument();
    expect(screen.getByText("Rakit Aplikasi Keuangan Pribadi")).toBeInTheDocument();
    expect(screen.getByText("Berhasil")).toBeInTheDocument();
  });
});
