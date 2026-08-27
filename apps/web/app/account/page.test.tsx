// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockRedirect = vi.hoisted(() =>
  vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
);

vi.mock("@dirakitpro/auth", () => ({ getCurrentUser: mockGetCurrentUser }));
vi.mock("next/navigation", () => ({ redirect: mockRedirect }));
// PublicHeader's signed-in state renders AccountMenu, which calls useClerk() —
// stub it the same way components/home/account-menu.test.tsx does.
vi.mock("@clerk/nextjs", () => ({ useClerk: () => ({ signOut: vi.fn() }) }));

const { default: AccountPage } = await import("./page");

const USER = {
  id: "user-1",
  email: "learner@example.com",
  username: "learner",
  displayName: "Learner",
  avatarUrl: null,
  role: "LEARNER",
  createdAt: new Date("2026-01-15T00:00:00Z"),
  updatedAt: new Date("2026-01-15T00:00:00Z"),
};

describe("AccountPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /login when unauthenticated (IAM-002)", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    await expect(AccountPage()).rejects.toThrow("REDIRECT:/login");
  });

  it("renders the signed-in user's email, username, role, and join date", async () => {
    mockGetCurrentUser.mockResolvedValue(USER);

    render(await AccountPage());

    expect(screen.getByText("learner@example.com")).toBeInTheDocument();
    expect(screen.getByText("learner")).toBeInTheDocument();
    expect(screen.getByText("LEARNER")).toBeInTheDocument();
    expect(screen.getByText(new Date("2026-01-15T00:00:00Z").toLocaleDateString("id-ID"))).toBeInTheDocument();
  });

  it("links to /account/orders and /projects/me, and offers a Keluar action", async () => {
    mockGetCurrentUser.mockResolvedValue(USER);

    render(await AccountPage());

    expect(screen.getByRole("button", { name: "Riwayat pembelian" })).toHaveAttribute("href", "/account/orders");
    expect(screen.getByRole("button", { name: "Rakitanku" })).toHaveAttribute("href", "/projects/me");
    expect(screen.getByRole("button", { name: "Keluar" })).toBeInTheDocument();
  });
});
