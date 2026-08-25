// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetBundleForAdmin = vi.hoisted(() => vi.fn());
const mockGetPublishedCourses = vi.hoisted(() => vi.fn());
const mockNotFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
);

vi.mock("@/features/admin/get-bundle-for-admin", () => ({ getBundleForAdmin: mockGetBundleForAdmin }));
vi.mock("@/features/catalog/get-published-courses", () => ({ getPublishedCourses: mockGetPublishedCourses }));
vi.mock("next/navigation", () => ({ notFound: mockNotFound }));
vi.mock("./actions", () => ({
  updateBundleAction: vi.fn(),
  activateBundleAction: vi.fn(),
  deactivateBundleAction: vi.fn(),
  reactivateBundleAction: vi.fn(),
  setBundleEligibleCoursesAction: vi.fn(),
}));

const { default: AdminBundleDetailPage } = await import("./page");

const BASE_BUNDLE = {
  id: "b1",
  slug: "paket-merdeka",
  title: "Paket Merdeka",
  description: "Pilih 2 course",
  type: "CHOOSE_N",
  selectionCount: 2,
  price: "299000",
  currency: "IDR",
  status: "DRAFT",
  startsAt: null,
  endsAt: null,
  eligibleCourses: [{ id: "course-1", title: "Rakitan Pertama" }],
};

function callPage(bundleId: string, searchParams: Record<string, string> = {}) {
  return AdminBundleDetailPage({
    params: Promise.resolve({ bundleId }),
    searchParams: Promise.resolve(searchParams),
  });
}

describe("AdminBundleDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPublishedCourses.mockResolvedValue([{ id: "course-1", title: "Rakitan Pertama" }, { id: "course-2", title: "Rakit Keuangan" }]);
    mockNotFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
  });

  it("404s when the bundle doesn't exist", async () => {
    mockGetBundleForAdmin.mockResolvedValue(null);
    await expect(callPage("b1")).rejects.toThrow("NOT_FOUND");
  });

  it("renders the edit form and eligible-course checklist, checking existing eligible courses", async () => {
    mockGetBundleForAdmin.mockResolvedValue(BASE_BUNDLE);

    render(await callPage("b1"));

    expect(screen.getByRole("heading", { name: "Paket Merdeka" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("paket-merdeka")).toBeInTheDocument();
    const checkedOne = screen.getByRole("checkbox", { name: "Rakitan Pertama" });
    const checkedTwo = screen.getByRole("checkbox", { name: "Rakit Keuangan" });
    expect(checkedOne).toBeChecked();
    expect(checkedTwo).not.toBeChecked();
  });

  it("shows an Activate button for a DRAFT bundle, with type editable", async () => {
    mockGetBundleForAdmin.mockResolvedValue({ ...BASE_BUNDLE, status: "DRAFT" });

    render(await callPage("b1"));

    expect(screen.getByRole("button", { name: "Activate" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "FIXED" })).not.toBeDisabled();
  });

  it("shows a Deactivate button for an ACTIVE bundle, with type locked", async () => {
    mockGetBundleForAdmin.mockResolvedValue({ ...BASE_BUNDLE, status: "ACTIVE" });

    render(await callPage("b1"));

    expect(screen.getByRole("button", { name: "Deactivate" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "FIXED" })).toBeDisabled();
  });

  it("shows a Reactivate button for an INACTIVE bundle", async () => {
    mockGetBundleForAdmin.mockResolvedValue({ ...BASE_BUNDLE, status: "INACTIVE" });

    render(await callPage("b1"));

    expect(screen.getByRole("button", { name: "Reactivate" })).toBeInTheDocument();
  });

  it("shows neither transition button for an EXPIRED bundle", async () => {
    mockGetBundleForAdmin.mockResolvedValue({ ...BASE_BUNDLE, status: "EXPIRED" });

    render(await callPage("b1"));

    expect(screen.queryByRole("button", { name: "Activate" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reactivate" })).not.toBeInTheDocument();
    expect(screen.getByText(/sudah expired/)).toBeInTheDocument();
  });

  it("shows the eligible-count warning from the ?warning= query param", async () => {
    mockGetBundleForAdmin.mockResolvedValue(BASE_BUNDLE);

    render(await callPage("b1", { warning: "Hanya 1 course eligible" }));

    expect(screen.getByText("Hanya 1 course eligible")).toBeInTheDocument();
  });
});
