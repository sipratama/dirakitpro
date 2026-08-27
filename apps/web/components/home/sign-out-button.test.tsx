// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignOut = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs", () => ({ useClerk: () => ({ signOut: mockSignOut }) }));

const { SignOutButton } = await import("./sign-out-button");

describe("SignOutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls Clerk signOut and redirects to / when clicked", () => {
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Keluar" }));

    expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: "/" });
  });
});
