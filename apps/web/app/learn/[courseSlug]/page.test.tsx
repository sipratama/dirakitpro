// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockGetEnrollmentAccess = vi.hoisted(() => vi.fn());
const mockGetBuildProgress = vi.hoisted(() => vi.fn());
const mockGetResumeLesson = vi.hoisted(() => vi.fn());
const mockGetCourseWorkspaceOutline = vi.hoisted(() => vi.fn());
const mockRedirect = vi.hoisted(() =>
  vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
);

vi.mock("@dirakitpro/auth", () => ({ getCurrentUser: mockGetCurrentUser }));
vi.mock("@/features/learning/get-enrollment-access", () => ({ getEnrollmentAccess: mockGetEnrollmentAccess }));
vi.mock("@/features/learning/get-build-progress", () => ({ getBuildProgress: mockGetBuildProgress }));
vi.mock("@/features/learning/get-resume-lesson", () => ({ getResumeLesson: mockGetResumeLesson }));
vi.mock("@/features/learning/get-course-workspace-outline", () => ({
  getCourseWorkspaceOutline: mockGetCourseWorkspaceOutline,
}));
vi.mock("next/navigation", () => ({ redirect: mockRedirect }));

const { default: CourseWorkspacePage } = await import("./page");

function callPage(courseSlug: string) {
  return CourseWorkspacePage({ params: Promise.resolve({ courseSlug }), searchParams: Promise.resolve({}) });
}

describe("CourseWorkspacePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
  });

  it("redirects to the public course page when the learner has no enrollment (LRN-006), not a 404", async () => {
    mockGetEnrollmentAccess.mockResolvedValue(null);
    await expect(callPage("rakit-finance-app")).rejects.toThrow("REDIRECT:/courses/rakit-finance-app");
  });

  it("renders the outline, build progress, resume CTA, and course-level resources", async () => {
    mockGetEnrollmentAccess.mockResolvedValue({
      course: {
        id: "c1",
        title: "Rakit Aplikasi Keuangan Pribadi",
        resources: [{ type: "resource_link", label: "Repo starter", url: "https://github.com/x/y" }],
      },
      enrollment: { id: "e1", status: "ACTIVE" },
    });
    mockGetBuildProgress.mockResolvedValue({ completedCount: 1, totalRequired: 2, ratio: 0.5 });
    mockGetResumeLesson.mockResolvedValue({ id: "l2", slug: "simpan-data", title: "Simpan data" });
    mockGetCourseWorkspaceOutline.mockResolvedValue([
      {
        id: "s1",
        title: "Make It Visible",
        position: 1,
        lessons: [
          {
            id: "l1",
            slug: "rancang",
            title: "Rancang dashboard",
            type: "CONCEPT",
            isRequired: true,
            progressStatus: "COMPLETED",
          },
        ],
      },
    ]);

    render(await callPage("rakit-finance-app"));

    expect(screen.getByText("Rakit Aplikasi Keuangan Pribadi")).toBeInTheDocument();
    expect(screen.getByText("50% Build Progress")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lanjut Merakit" })).toHaveAttribute(
      "href",
      "/learn/rakit-finance-app/simpan-data",
    );
    expect(screen.getByText("Rancang dashboard")).toBeInTheDocument();
    expect(screen.getByText("Selesai")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Repo starter" })).toHaveAttribute("href", "https://github.com/x/y");
  });

  it("renders normally (no special-casing) when the course has no resources at all", async () => {
    mockGetEnrollmentAccess.mockResolvedValue({
      course: { id: "c1", title: "Course tanpa resource", resources: [] },
      enrollment: { id: "e1", status: "ACTIVE" },
    });
    mockGetBuildProgress.mockResolvedValue({ completedCount: 0, totalRequired: 0, ratio: 0 });
    mockGetResumeLesson.mockResolvedValue(null);
    mockGetCourseWorkspaceOutline.mockResolvedValue([]);

    render(await callPage("course-tanpa-resource"));

    expect(screen.getByText("Course tanpa resource")).toBeInTheDocument();
    expect(screen.queryByText("Resource course")).not.toBeInTheDocument();
  });
});
