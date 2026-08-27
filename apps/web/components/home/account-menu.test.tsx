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

  it("opens to reveal links to /dashboard, /account, /account/orders, and a Keluar action (IAM-002)", async () => {
    render(<AccountMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Akun" }));

    expect(await screen.findByRole("menuitem", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("menuitem", { name: "Akun saya" })).toHaveAttribute("href", "/account");
    expect(screen.getByRole("menuitem", { name: "Riwayat pembelian" })).toHaveAttribute("href", "/account/orders");
    expect(screen.getByRole("menuitem", { name: "Keluar" })).toBeInTheDocument();
  });

  it("renders Keluar as a native button and calls Clerk signOut with the home redirect", async () => {
    mockSignOut.mockResolvedValue(undefined);
    render(<AccountMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Akun" }));
    const signOutItem = await screen.findByRole("menuitem", { name: "Keluar" });

    expect(signOutItem.tagName).toBe("BUTTON");
    expect(signOutItem).toHaveAttribute("type", "button");

    fireEvent.click(signOutItem);

    expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: "/" });
  });

  // Regression coverage for the bug found during real-browser investigation:
  // Menu.LinkItem defaults closeOnClick to false (unlike Menu.Item's true), so
  // clicking Dashboard/Akun saya navigated correctly but left the dropdown
  // open. Asserting href alone (as the tests above do) doesn't catch this —
  // only checking that the popup actually closes after the click does.
  it("closes the dropdown after clicking Dashboard", async () => {
    render(<AccountMenu />);

    const trigger = screen.getByRole("button", { name: "Akun" });
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Dashboard" }));

    expect(screen.queryByRole("menuitem", { name: "Dashboard" })).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the dropdown after clicking Akun saya", async () => {
    render(<AccountMenu />);

    const trigger = screen.getByRole("button", { name: "Akun" });
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Akun saya" }));

    expect(screen.queryByRole("menuitem", { name: "Akun saya" })).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the dropdown after clicking Riwayat pembelian", async () => {
    render(<AccountMenu />);

    const trigger = screen.getByRole("button", { name: "Akun" });
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Riwayat pembelian" }));

    expect(screen.queryByRole("menuitem", { name: "Riwayat pembelian" })).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the dropdown after clicking Keluar", async () => {
    render(<AccountMenu />);

    const trigger = screen.getByRole("button", { name: "Akun" });
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Keluar" }));

    expect(screen.queryByRole("menuitem", { name: "Keluar" })).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
