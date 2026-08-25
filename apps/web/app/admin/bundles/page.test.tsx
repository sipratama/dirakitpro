// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetBundlesForAdmin = vi.hoisted(() => vi.fn());

vi.mock("@/features/admin/get-bundles-for-admin", () => ({
  getBundlesForAdmin: mockGetBundlesForAdmin,
}));

const { default: AdminBundlesPage } = await import("./page");

describe("AdminBundlesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a calm empty state and a link to create a new bundle", async () => {
    mockGetBundlesForAdmin.mockResolvedValue([]);

    render(await AdminBundlesPage());

    expect(screen.getByText("Belum ada bundle.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ Bundle baru" })).toHaveAttribute("href", "/admin/bundles/new");
  });

  it("renders a row per bundle with title, type, status, price, and a link to edit", async () => {
    mockGetBundlesForAdmin.mockResolvedValue([
      { id: "b1", title: "Paket Merdeka", type: "CHOOSE_N", status: "ACTIVE", price: "299000" },
    ]);

    render(await AdminBundlesPage());

    expect(screen.getByText("Paket Merdeka")).toBeInTheDocument();
    expect(screen.getByText("CHOOSE_N")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute("href", "/admin/bundles/b1");
  });
});
