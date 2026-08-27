// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({ useClerk: () => ({ signOut: vi.fn() }) }));

const { PublicHeader } = await import("./public-header");

const USER = {
  id: "user-1",
  email: "learner@example.com",
  username: "learner",
  displayName: "Learner",
  avatarUrl: null,
  role: "LEARNER",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
} as const;

describe("PublicHeader", () => {
  it("shows the account dropdown trigger, not Masuk/Mulai Merakit, when a user is signed in", () => {
    render(<PublicHeader user={USER as never} />);

    expect(screen.getByRole("button", { name: "Akun" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Masuk" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mulai Merakit" })).not.toBeInTheDocument();
  });

  it("shows Masuk/Mulai Merakit, not the account dropdown, when signed out", () => {
    render(<PublicHeader user={null} />);

    expect(screen.queryByRole("button", { name: "Akun" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Masuk" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("button", { name: "Mulai Merakit" })).toHaveAttribute("href", "/register");
  });
});
