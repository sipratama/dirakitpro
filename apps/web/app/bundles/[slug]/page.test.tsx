// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BundleDetail } from "@/features/catalog/get-bundle-by-slug";
import BundleDetailPage from "./page";

const { getCurrentUserMock, getBundleBySlugMock, getBundleEligibleCountMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  getBundleBySlugMock: vi.fn(),
  getBundleEligibleCountMock: vi.fn(),
}));

vi.mock("@dirakitpro/auth", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/features/catalog/get-bundle-by-slug", () => ({ getBundleBySlug: getBundleBySlugMock }));
vi.mock("@/features/catalog/get-bundle-eligibility", () => ({
  getBundleEligibleCount: getBundleEligibleCountMock,
}));

function buildBundle(overrides: Partial<BundleDetail> = {}): BundleDetail {
  return {
    id: "bundle-1",
    slug: "paket-merdeka",
    title: "Paket Merdeka",
    description: "Pilih 2 course dari eligible catalog.",
    type: "FIXED",
    selectionCount: null,
    price: "299000",
    currency: "IDR",
    status: "ACTIVE",
    startsAt: null,
    endsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    courses: [],
    ...overrides,
  };
}

function buildCourse(overrides: Partial<BundleDetail["courses"][number]> = {}) {
  return {
    id: "course-1",
    slug: "course-1",
    title: "Course 1",
    outcomeDescription: "Outcome",
    description: "Description",
    difficulty: null,
    durationEstimate: null,
    thumbnailUrl: null,
    status: "PUBLISHED" as const,
    price: "149000",
    currency: "IDR",
    resources: [],
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    alreadyOwned: false,
    ...overrides,
  };
}

describe("BundleDetailPage", () => {
  beforeEach(() => {
    getCurrentUserMock.mockReset();
    getBundleBySlugMock.mockReset();
    getBundleEligibleCountMock.mockReset();
    getCurrentUserMock.mockResolvedValue(null);
  });

  it("renders every included course as a plain (non-interactive) list for a FIXED bundle", async () => {
    getBundleBySlugMock.mockResolvedValue(
      buildBundle({
        type: "FIXED",
        courses: [buildCourse({ id: "a", title: "Course A" }), buildCourse({ id: "b", title: "Course B" })],
      }),
    );

    render(await BundleDetailPage({ params: Promise.resolve({ slug: "paket-merdeka" }), searchParams: Promise.resolve({}) }));

    expect(screen.getByText("Course A")).toBeInTheDocument();
    expect(screen.getByText("Course B")).toBeInTheDocument();
    // FIXED has nothing to select — no selectable course buttons should exist.
    expect(screen.queryByRole("button", { pressed: false })).not.toBeInTheDocument();
  });

  it("renders an INACTIVE bundle with a reason instead of 404", async () => {
    getBundleBySlugMock.mockResolvedValue(buildBundle({ status: "INACTIVE" }));

    render(await BundleDetailPage({ params: Promise.resolve({ slug: "paket-merdeka" }), searchParams: Promise.resolve({}) }));

    expect(screen.getByText("Paket Merdeka")).toBeInTheDocument();
    expect(
      screen.getByText("Bundle ini sedang tidak aktif atau di luar periode campaign, jadi belum bisa dibeli saat ini."),
    ).toBeInTheDocument();
  });

  it("throws notFound() only when the slug doesn't resolve to any bundle at all", async () => {
    getBundleBySlugMock.mockResolvedValue(null);

    await expect(
      BundleDetailPage({ params: Promise.resolve({ slug: "does-not-exist" }), searchParams: Promise.resolve({}) }),
    ).rejects.toThrow();
  });

  it("shows the per-learner 'not enough eligible courses' state for CHOOSE_N, distinct from the bundle-inactive state", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "learner-1" });
    getBundleBySlugMock.mockResolvedValue(
      buildBundle({
        type: "CHOOSE_N",
        selectionCount: 2,
        status: "ACTIVE",
        courses: [buildCourse({ id: "a" }), buildCourse({ id: "b" })],
      }),
    );
    getBundleEligibleCountMock.mockResolvedValue(1);

    render(await BundleDetailPage({ params: Promise.resolve({ slug: "paket-merdeka" }), searchParams: Promise.resolve({}) }));

    expect(
      screen.getByText(
        "Kamu sudah memiliki sebagian besar course eligible di bundle ini, jadi tidak tersisa cukup course untuk memenuhi syarat pilih 2 course.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Bundle ini sedang tidak aktif atau di luar periode campaign, jadi belum bisa dibeli saat ini."),
    ).not.toBeInTheDocument();
  });
});
