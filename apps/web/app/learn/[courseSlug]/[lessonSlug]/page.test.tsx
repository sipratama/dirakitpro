// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockGetEnrollmentAccess = vi.hoisted(() => vi.fn());
const mockGetLessonBySlug = vi.hoisted(() => vi.fn());
const mockGetBuildProgress = vi.hoisted(() => vi.fn());
const mockGetAdjacentLessons = vi.hoisted(() => vi.fn());
const mockGetCourseWorkspaceOutline = vi.hoisted(() => vi.fn());
const mockMarkLessonCompleteAction = vi.hoisted(() => vi.fn(() => Promise.resolve()));
const mockRedirect = vi.hoisted(() =>
  vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
);
const mockNotFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
);

vi.mock("@dirakitpro/auth", () => ({ getCurrentUser: mockGetCurrentUser }));
vi.mock("@/features/learning/get-enrollment-access", () => ({ getEnrollmentAccess: mockGetEnrollmentAccess }));
vi.mock("@/features/learning/get-lesson-by-slug", () => ({ getLessonBySlug: mockGetLessonBySlug }));
vi.mock("@/features/learning/get-build-progress", () => ({ getBuildProgress: mockGetBuildProgress }));
vi.mock("@/features/learning/get-adjacent-lessons", () => ({ getAdjacentLessons: mockGetAdjacentLessons }));
vi.mock("@/features/learning/get-course-workspace-outline", () => ({
  getCourseWorkspaceOutline: mockGetCourseWorkspaceOutline,
}));
vi.mock("@/app/learn/[courseSlug]/[lessonSlug]/actions", () => ({
  markLessonCompleteAction: mockMarkLessonCompleteAction,
}));
vi.mock("next/navigation", () => ({ redirect: mockRedirect, notFound: mockNotFound }));

const { default: LessonPage } = await import("./page");

function callPage(courseSlug: string, lessonSlug: string) {
  return LessonPage({ params: Promise.resolve({ courseSlug, lessonSlug }), searchParams: Promise.resolve({}) });
}

const OUTLINE = [
  {
    id: "s1",
    title: "Make It Visible",
    position: 1,
    lessons: [
      { id: "l1", slug: "rancang", title: "Rancang dashboard", type: "CONCEPT", isRequired: true, progressStatus: "COMPLETED" },
      { id: "l2", slug: "bangun", title: "Bangun tampilan", type: "CHECKPOINT", isRequired: true, progressStatus: "NOT_STARTED" },
    ],
  },
];

describe("LessonPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    mockNotFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetBuildProgress.mockResolvedValue({ completedCount: 0, totalRequired: 2, ratio: 0 });
    mockGetAdjacentLessons.mockResolvedValue({ previous: null, next: null });
    mockGetCourseWorkspaceOutline.mockResolvedValue(OUTLINE);
  });

  it("redirects to the public course page when the learner has no enrollment", async () => {
    mockGetEnrollmentAccess.mockResolvedValue(null);
    await expect(callPage("rakit-finance-app", "rancang")).rejects.toThrow("REDIRECT:/courses/rakit-finance-app");
  });

  it("404s when the lesson doesn't exist (or belongs to another course) — §3.4", async () => {
    mockGetEnrollmentAccess.mockResolvedValue({ course: { id: "c1", title: "Course" }, enrollment: { id: "e1" } });
    mockGetLessonBySlug.mockResolvedValue(null);

    await expect(callPage("rakit-finance-app", "does-not-exist")).rejects.toThrow("NOT_FOUND");
  });

  it("renders a CONCEPT lesson's markdown content with 'Tandai selesai' enabled", async () => {
    mockGetEnrollmentAccess.mockResolvedValue({ course: { id: "c1", title: "Course" }, enrollment: { id: "e1" } });
    mockGetLessonBySlug.mockResolvedValue({
      id: "l-new",
      slug: "rancang-baru",
      title: "Rancang dashboard v2",
      type: "CONCEPT",
      buildMilestoneId: null,
      content: [{ type: "markdown", markdown: "Konsep dashboard" }],
    });

    render(await callPage("rakit-finance-app", "rancang-baru"));

    expect(screen.getByText("Rancang dashboard v2")).toBeInTheDocument();
    expect(screen.getByText("Konsep dashboard")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tandai selesai" })).not.toBeDisabled();
  });

  it("renders a DEPLOY lesson as informational content only, no URL submission form", async () => {
    mockGetEnrollmentAccess.mockResolvedValue({ course: { id: "c1", title: "Course" }, enrollment: { id: "e1" } });
    mockGetLessonBySlug.mockResolvedValue({
      id: "l3",
      slug: "deploy",
      title: "Deploy aplikasi",
      type: "DEPLOY",
      buildMilestoneId: null,
      content: [{ type: "markdown", markdown: "Deploy ke Vercel lalu tandai selesai." }],
    });

    render(await callPage("rakit-finance-app", "deploy"));

    expect(screen.getByText("Deploy ke Vercel lalu tandai selesai.")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tandai selesai" })).not.toBeDisabled();
  });

  it("disables 'Tandai selesai' for a CHECKPOINT lesson until every task item is checked", async () => {
    mockGetEnrollmentAccess.mockResolvedValue({ course: { id: "c1", title: "Course" }, enrollment: { id: "e1" } });
    mockGetLessonBySlug.mockResolvedValue({
      id: "l2",
      slug: "bangun",
      title: "Bangun tampilan",
      type: "CHECKPOINT",
      buildMilestoneId: "m1",
      content: [{ type: "task", items: [{ id: "t1", label: "Selesaikan build" }] }],
    });

    render(await callPage("rakit-finance-app", "bangun"));

    const button = screen.getByRole("button", { name: "Tandai selesai" });
    expect(button).toBeDisabled();

    fireEvent.click(screen.getByLabelText("Selesaikan build"));
    expect(button).not.toBeDisabled();
  });

  it("shows 'Selesai ditandai' (disabled) when the current lesson is already COMPLETED", async () => {
    mockGetEnrollmentAccess.mockResolvedValue({ course: { id: "c1", title: "Course" }, enrollment: { id: "e1" } });
    mockGetLessonBySlug.mockResolvedValue({
      id: "l1",
      slug: "rancang",
      title: "Rancang dashboard",
      type: "CONCEPT",
      buildMilestoneId: null,
      content: [],
    });

    render(await callPage("rakit-finance-app", "rancang"));

    expect(screen.getByRole("button", { name: "Selesai ditandai" })).toBeDisabled();
  });

  it("renders both prev and next lesson navigation links when both exist", async () => {
    mockGetEnrollmentAccess.mockResolvedValue({ course: { id: "c1", title: "Course" }, enrollment: { id: "e1" } });
    mockGetLessonBySlug.mockResolvedValue({
      id: "l2",
      slug: "bangun",
      title: "Bangun tampilan",
      type: "BUILD",
      buildMilestoneId: null,
      content: [],
    });
    mockGetAdjacentLessons.mockResolvedValue({
      previous: { id: "l1", slug: "rancang", title: "Rancang dashboard" },
      next: { id: "l3", slug: "deploy", title: "Deploy aplikasi" },
    });

    render(await callPage("rakit-finance-app", "bangun"));

    expect(screen.getByRole("link", { name: /← Rancang dashboard/ })).toHaveAttribute(
      "href",
      "/learn/rakit-finance-app/rancang",
    );
    expect(screen.getByRole("link", { name: /Deploy aplikasi →/ })).toHaveAttribute(
      "href",
      "/learn/rakit-finance-app/deploy",
    );
  });

  it("omits the previous link on the first lesson and the next link on the last lesson", async () => {
    mockGetEnrollmentAccess.mockResolvedValue({ course: { id: "c1", title: "Course" }, enrollment: { id: "e1" } });
    mockGetLessonBySlug.mockResolvedValue({
      id: "l1",
      slug: "rancang",
      title: "Rancang dashboard",
      type: "CONCEPT",
      buildMilestoneId: null,
      content: [],
    });
    mockGetAdjacentLessons.mockResolvedValue({ previous: null, next: null });

    render(await callPage("rakit-finance-app", "rancang"));

    expect(screen.queryByRole("link", { name: /←/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /→/ })).not.toBeInTheDocument();
  });
});
