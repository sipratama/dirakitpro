// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUsersForAdmin = vi.hoisted(() => vi.fn());

vi.mock("@/features/admin/get-users-for-admin", () => ({ getUsersForAdmin: mockGetUsersForAdmin }));

const { default: AdminUsersPage } = await import("./page");

describe("AdminUsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an empty message when there are no users", async () => {
    mockGetUsersForAdmin.mockResolvedValue([]);

    render(await AdminUsersPage());

    expect(screen.getByText("Belum ada user.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders a table row per user with email, username, role, and enrollment count", async () => {
    mockGetUsersForAdmin.mockResolvedValue([
      {
        id: "u1",
        email: "learner@example.com",
        username: "learner1",
        role: "LEARNER",
        createdAt: new Date("2026-01-15"),
        enrollmentCount: 2,
      },
    ]);

    render(await AdminUsersPage());

    expect(screen.getByText("learner@example.com")).toBeInTheDocument();
    expect(screen.getByText("learner1")).toBeInTheDocument();
    expect(screen.getByText("LEARNER")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
