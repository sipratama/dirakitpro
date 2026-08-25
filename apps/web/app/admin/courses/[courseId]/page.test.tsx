// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCourseForAdmin = vi.hoisted(() => vi.fn());
const mockNotFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
);

vi.mock("@/features/admin/get-course-for-admin", () => ({ getCourseForAdmin: mockGetCourseForAdmin }));
vi.mock("next/navigation", () => ({ notFound: mockNotFound }));
vi.mock("./actions", () => ({
  updateCourseAction: vi.fn(),
  publishCourseAction: vi.fn(),
  unpublishCourseAction: vi.fn(),
}));

const { default: AdminCourseDetailPage } = await import("./page");

const BASE_COURSE = {
  id: "c1",
  slug: "rakitan-pertama",
  title: "Rakitan Pertama",
  outcomeDescription: "Bangun personal website",
  description: "Deskripsi lengkap",
  difficulty: "Beginner",
  durationEstimate: "4 minggu",
  thumbnailUrl: "https://example.com/thumb.png",
  status: "DRAFT",
  price: "0",
  currency: "IDR",
  resources: [{ type: "resource_link", label: "Repo", url: "https://github.com/example/repo" }],
};

function callPage(courseId: string) {
  return AdminCourseDetailPage({ params: Promise.resolve({ courseId }), searchParams: Promise.resolve({}) });
}

describe("AdminCourseDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
  });

  it("404s when the course doesn't exist", async () => {
    mockGetCourseForAdmin.mockResolvedValue(null);
    await expect(callPage("c1")).rejects.toThrow("NOT_FOUND");
  });

  it("renders the edit form pre-filled with the course's fields", async () => {
    mockGetCourseForAdmin.mockResolvedValue(BASE_COURSE);

    render(await callPage("c1"));

    expect(screen.getByRole("heading", { name: "Rakitan Pertama" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("rakitan-pertama")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Bangun personal website")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Repo | https://github.com/example/repo")).toBeInTheDocument();
  });

  it("shows a Publish button for a DRAFT course, not Unpublish", async () => {
    mockGetCourseForAdmin.mockResolvedValue({ ...BASE_COURSE, status: "DRAFT" });

    render(await callPage("c1"));

    expect(screen.getByRole("button", { name: "Publish" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Unpublish" })).not.toBeInTheDocument();
  });

  it("shows an Unpublish button for a PUBLISHED course, not Publish", async () => {
    mockGetCourseForAdmin.mockResolvedValue({ ...BASE_COURSE, status: "PUBLISHED" });

    render(await callPage("c1"));

    expect(screen.getByRole("button", { name: "Unpublish" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Publish" })).not.toBeInTheDocument();
  });
});
