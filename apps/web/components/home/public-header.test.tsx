// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetActiveBundles = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs", () => ({ useClerk: () => ({ signOut: vi.fn() }) }));
vi.mock("@/features/catalog/get-active-bundles", () => ({
  getActiveBundles: mockGetActiveBundles,
}));

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

function makeBundle(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "bundle-1",
    slug: "rakit-fullstack",
    title: "Bundle Rakit Fullstack",
    description: "Paket lengkap.",
    type: "FIXED",
    selectionCount: null,
    price: "499000",
    currency: "IDR",
    status: "ACTIVE",
    startsAt: null,
    endsAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("PublicHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetActiveBundles.mockResolvedValue([]);
  });

  // PublicHeader is now an async Server Component (it fetches active bundles
  // itself) — call it directly and await the JSX it returns, matching the
  // pattern app/page.test.tsx uses for Home().
  it("shows the account dropdown trigger, not Masuk/Mulai Merakit, when a user is signed in", async () => {
    render(await PublicHeader({ user: USER as never }));

    expect(screen.getByRole("button", { name: "Akun" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Masuk" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mulai Merakit" })).not.toBeInTheDocument();
  });

  it("shows Masuk/Mulai Merakit, not the account dropdown, when signed out", async () => {
    render(await PublicHeader({ user: null }));

    expect(screen.queryByRole("button", { name: "Akun" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Masuk" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("button", { name: "Mulai Merakit" })).toHaveAttribute("href", "/register");
  });

  // Regression case: this is the common state (no campaign running) and must
  // never show a stray badge/link.
  it("renders no promo badge when there are no active bundles", async () => {
    mockGetActiveBundles.mockResolvedValue([]);

    render(await PublicHeader({ user: null }));

    expect(screen.queryByRole("link", { name: /bundle/i })).not.toBeInTheDocument();
  });

  it("shows a promo badge linking to the bundle's own page when exactly one bundle is active", async () => {
    mockGetActiveBundles.mockResolvedValue([makeBundle({ slug: "rakit-fullstack", title: "Bundle Rakit Fullstack" })]);

    render(await PublicHeader({ user: null }));

    const badge = screen.getByRole("link", { name: "Bundle Rakit Fullstack" });
    expect(badge).toHaveAttribute("href", "/bundles/rakit-fullstack");
  });

  it("shows a promo badge linking to /bundles when multiple bundles are active", async () => {
    mockGetActiveBundles.mockResolvedValue([
      makeBundle({ id: "bundle-1", slug: "rakit-fullstack", title: "Bundle Rakit Fullstack" }),
      makeBundle({ id: "bundle-2", slug: "rakit-mobile", title: "Bundle Rakit Mobile" }),
    ]);

    render(await PublicHeader({ user: null }));

    const badge = screen.getByRole("link", { name: "Bundle aktif" });
    expect(badge).toHaveAttribute("href", "/bundles");
  });
});
