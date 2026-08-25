// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCourseForAdmin = vi.hoisted(() => vi.fn());
const mockGetCurriculumForAdmin = vi.hoisted(() => vi.fn());
const mockNotFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
);

vi.mock("@/features/admin/get-course-for-admin", () => ({ getCourseForAdmin: mockGetCourseForAdmin }));
vi.mock("@/features/admin/get-curriculum-for-admin", () => ({ getCurriculumForAdmin: mockGetCurriculumForAdmin }));
vi.mock("next/navigation", () => ({ notFound: mockNotFound }));
vi.mock("./actions", () => ({
  addCourseStageAction: vi.fn(),
  updateCourseStageAction: vi.fn(),
  deleteCourseStageAction: vi.fn(),
  moveCourseStageAction: vi.fn(),
  addLessonAction: vi.fn(),
  updateLessonMetadataAction: vi.fn(),
  deleteLessonAction: vi.fn(),
  moveLessonAction: vi.fn(),
}));

const { default: AdminCurriculumPage } = await import("./page");

function callPage(courseId: string) {
  return AdminCurriculumPage({ params: Promise.resolve({ courseId }), searchParams: Promise.resolve({}) });
}

describe("AdminCurriculumPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
  });

  it("404s when the course doesn't exist", async () => {
    mockGetCourseForAdmin.mockResolvedValue(null);
    mockGetCurriculumForAdmin.mockResolvedValue({ stages: [], milestones: [] });

    await expect(callPage("c1")).rejects.toThrow("NOT_FOUND");
  });

  it("shows a calm empty state and the add-stage form when there are no stages", async () => {
    mockGetCourseForAdmin.mockResolvedValue({ id: "c1", title: "Rakitan Pertama" });
    mockGetCurriculumForAdmin.mockResolvedValue({ stages: [], milestones: [] });

    render(await callPage("c1"));

    expect(screen.getByText("Belum ada stage.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Judul stage baru")).toBeInTheDocument();
  });

  it("renders stages and their lessons, with the milestone dropdown populated", async () => {
    mockGetCourseForAdmin.mockResolvedValue({ id: "c1", title: "Rakitan Pertama" });
    mockGetCurriculumForAdmin.mockResolvedValue({
      stages: [
        {
          id: "stage-1",
          title: "Stage 1",
          position: 1,
          lessons: [
            { id: "lesson-1", slug: "lesson-1", title: "Lesson 1", type: "CONCEPT", isRequired: true, position: 1, buildMilestoneId: null },
          ],
        },
      ],
      milestones: [{ id: "milestone-1", title: "Live di internet", position: 1, isRequired: true }],
    });

    render(await callPage("c1"));

    expect(screen.getByDisplayValue("Stage 1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Lesson 1")).toBeInTheDocument();
    expect(screen.getAllByText("Live di internet").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Edit content →" })).toHaveAttribute(
      "href",
      "/admin/courses/c1/curriculum/lessons/lesson-1",
    );
  });

  it("shows a calm empty state per stage when it has no lessons yet", async () => {
    mockGetCourseForAdmin.mockResolvedValue({ id: "c1", title: "Rakitan Pertama" });
    mockGetCurriculumForAdmin.mockResolvedValue({
      stages: [{ id: "stage-1", title: "Stage 1", position: 1, lessons: [] }],
      milestones: [],
    });

    render(await callPage("c1"));

    expect(screen.getByText("Belum ada lesson di stage ini.")).toBeInTheDocument();
  });
});
