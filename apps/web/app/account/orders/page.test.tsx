// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockGetOrdersForUser = vi.hoisted(() => vi.fn());

vi.mock("@dirakitpro/auth", () => ({ getCurrentUser: mockGetCurrentUser }));
vi.mock("@/features/commerce/get-orders-for-user", () => ({ getOrdersForUser: mockGetOrdersForUser }));

const { default: AccountOrdersPage } = await import("./page");

describe("AccountOrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
  });

  it("shows a calm empty state when the learner has never purchased anything", async () => {
    mockGetOrdersForUser.mockResolvedValue([]);

    render(await AccountOrdersPage());

    expect(screen.getByText("Kamu belum melakukan pembelian apa pun.")).toBeInTheDocument();
  });

  it("lists each order with its item title, status label, amount, and granted courses (COM-012)", async () => {
    mockGetOrdersForUser.mockResolvedValue([
      {
        id: "order-1",
        itemTitle: "Rakit Aplikasi Keuangan Pribadi",
        status: "PAID",
        totalAmount: "149000.00",
        grantedCourseTitles: ["Rakit Aplikasi Keuangan Pribadi"],
      },
      {
        id: "order-2",
        itemTitle: "Paket Merdeka",
        status: "PENDING",
        totalAmount: "299000.00",
        grantedCourseTitles: [],
      },
    ]);

    render(await AccountOrdersPage());

    expect(screen.getByText("Rakit Aplikasi Keuangan Pribadi")).toBeInTheDocument();
    expect(screen.getByText("Berhasil")).toBeInTheDocument();
    expect(screen.getByText("Paket Merdeka")).toBeInTheDocument();
    expect(screen.getByText("Menunggu pembayaran")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Rakit Aplikasi Keuangan Pribadi/ })).toHaveAttribute(
      "href",
      "/payment/order-1",
    );
  });
});
