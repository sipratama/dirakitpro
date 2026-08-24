// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CourseWithOwnership } from "@/features/catalog/get-published-courses";
import CourseDetailPage from "./page";

const { getCurrentUserMock, getCourseBySlugMock, getCourseCurriculumSummaryMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  getCourseBySlugMock: vi.fn(),
  getCourseCurriculumSummaryMock: vi.fn(),
}));

vi.mock("@dirakitpro/auth", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/features/catalog/get-course-by-slug", () => ({ getCourseBySlug: getCourseBySlugMock }));
vi.mock("@/features/catalog/get-course-curriculum-summary", () => ({
  getCourseCurriculumSummary: getCourseCurriculumSummaryMock,
}));

function buildCourse(overrides: Partial<CourseWithOwnership> = {}): CourseWithOwnership {
  return {
    id: "course-1",
    slug: "rakitan-pertama",
    title: "Rakitan Pertama — Personal Website",
    outcomeDescription: "Personal website responsive yang live dan dapat dibagikan.",
    description: "Belajar dari nol sampai deploy.",
    difficulty: "Beginner",
    durationEstimate: "4 jam",
    thumbnailUrl: null,
    status: "PUBLISHED",
    price: "0",
    currency: "IDR",
    resources: [],
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isOwned: false,
    ...overrides,
  };
}

describe("CourseDetailPage", () => {
  beforeEach(() => {
    getCurrentUserMock.mockReset();
    getCourseBySlugMock.mockReset();
    getCourseCurriculumSummaryMock.mockReset();
    getCourseCurriculumSummaryMock.mockResolvedValue([]);
  });

  it("shows 'Lanjut Merakit' -> /learn/[slug] when the learner already owns the course", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "user-1" });
    getCourseBySlugMock.mockResolvedValue(buildCourse({ isOwned: true }));

    render(await CourseDetailPage({ params: Promise.resolve({ slug: "rakitan-pertama" }), searchParams: Promise.resolve({}) }));

    const [cta] = screen.getAllByRole("link", { name: "Lanjut Merakit" });
    expect(cta).toHaveAttribute("href", "/learn/rakitan-pertama");
  });

  it("shows 'Mulai Merakit' -> /checkout/course/[slug] when the learner does not own the course", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "user-1" });
    getCourseBySlugMock.mockResolvedValue(buildCourse({ isOwned: false }));

    render(await CourseDetailPage({ params: Promise.resolve({ slug: "rakitan-pertama" }), searchParams: Promise.resolve({}) }));

    const [cta] = screen.getAllByRole("link", { name: "Mulai Merakit" });
    expect(cta).toHaveAttribute("href", "/checkout/course/rakitan-pertama");
  });

  it("shows 'Mulai Merakit' for a guest (no session), same as a non-owning learner", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    getCourseBySlugMock.mockResolvedValue(buildCourse({ isOwned: false }));

    render(await CourseDetailPage({ params: Promise.resolve({ slug: "rakitan-pertama" }), searchParams: Promise.resolve({}) }));

    const [cta] = screen.getAllByRole("link", { name: "Mulai Merakit" });
    expect(cta).toHaveAttribute("href", "/checkout/course/rakitan-pertama");
  });

  it("throws Next's notFound() when the slug doesn't resolve to a PUBLISHED course", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    getCourseBySlugMock.mockResolvedValue(null);

    await expect(
      CourseDetailPage({ params: Promise.resolve({ slug: "does-not-exist" }), searchParams: Promise.resolve({}) }),
    ).rejects.toThrow();
  });

  it("renders the curriculum outline grouped by stage, lessons in position order", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    getCourseBySlugMock.mockResolvedValue(buildCourse());
    getCourseCurriculumSummaryMock.mockResolvedValue([
      { id: "stage-1", title: "Make It Visible", lessons: [{ id: "l1", title: "Setup project", type: "CONCEPT" }] },
      { id: "stage-2", title: "Make It Interactive", lessons: [{ id: "l2", title: "Add form", type: "BUILD" }] },
    ]);

    render(await CourseDetailPage({ params: Promise.resolve({ slug: "rakitan-pertama" }), searchParams: Promise.resolve({}) }));

    const stageHeadings = screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent);
    expect(stageHeadings).toEqual(["Make It Visible", "Make It Interactive"]);
    expect(screen.getByText("Setup project")).toBeInTheDocument();
    expect(screen.getByText("Add form")).toBeInTheDocument();
  });
});
