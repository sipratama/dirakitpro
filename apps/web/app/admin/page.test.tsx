// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetPendingModerationCount = vi.hoisted(() => vi.fn());

vi.mock("@/features/admin/get-pending-moderation-count", () => ({
  getPendingModerationCount: mockGetPendingModerationCount,
}));

const { default: AdminDashboardPage } = await import("./page");

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("links to all three sections, with the pending moderation count linking to the pre-filtered queue", async () => {
    mockGetPendingModerationCount.mockResolvedValue(3);

    render(await AdminDashboardPage());

    expect(screen.getByText("3 menunggu")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Moderasi project/ })).toHaveAttribute(
      "href",
      "/admin/projects?status=UNREVIEWED",
    );
    expect(screen.getByRole("link", { name: "Learner" })).toHaveAttribute("href", "/admin/users");
    expect(screen.getByRole("link", { name: "Orders" })).toHaveAttribute("href", "/admin/orders");
  });

  it("shows 0 menunggu when nothing is pending", async () => {
    mockGetPendingModerationCount.mockResolvedValue(0);

    render(await AdminDashboardPage());

    expect(screen.getByText("0 menunggu")).toBeInTheDocument();
  });
});
