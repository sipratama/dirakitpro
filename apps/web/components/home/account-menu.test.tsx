// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignOut = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs", () => ({ useClerk: () => ({ signOut: mockSignOut }) }));

const { AccountMenu } = await import("./account-menu");

describe("AccountMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens to reveal links to /dashboard and /account, and a Keluar action (IAM-002)", async () => {
    render(<AccountMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Akun" }));

    expect(await screen.findByRole("menuitem", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("menuitem", { name: "Akun saya" })).toHaveAttribute("href", "/account");
    expect(screen.getByRole("menuitem", { name: "Keluar" })).toBeInTheDocument();
  });

  it("calls Clerk signOut and redirects to / when Keluar is clicked", async () => {
    render(<AccountMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Akun" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Keluar" }));

    expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: "/" });
  });
});
