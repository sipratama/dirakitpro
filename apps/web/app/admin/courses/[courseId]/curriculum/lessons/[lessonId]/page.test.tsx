// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetLessonForAdmin = vi.hoisted(() => vi.fn());
const mockSubmitLessonContentAction = vi.hoisted(() => vi.fn());
const mockNotFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
);

vi.mock("@/features/admin/get-lesson-for-admin", () => ({ getLessonForAdmin: mockGetLessonForAdmin }));
vi.mock("next/navigation", () => ({ notFound: mockNotFound }));
vi.mock("./actions", () => ({ submitLessonContentAction: mockSubmitLessonContentAction }));

const { default: AdminLessonContentPage } = await import("./page");

function callPage(courseId: string, lessonId: string) {
  return AdminLessonContentPage({
    params: Promise.resolve({ courseId, lessonId }),
    searchParams: Promise.resolve({}),
  });
}

describe("AdminLessonContentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
  });

  it("404s when the lesson doesn't exist", async () => {
    mockGetLessonForAdmin.mockResolvedValue(null);
    await expect(callPage("c1", "l1")).rejects.toThrow("NOT_FOUND");
  });

  it("404s when the lesson belongs to a different course", async () => {
    mockGetLessonForAdmin.mockResolvedValue({
      id: "l1",
      courseId: "other-course",
      slug: "lesson-1",
      title: "Lesson 1",
      type: "CONCEPT",
      content: [],
    });
    await expect(callPage("c1", "l1")).rejects.toThrow("NOT_FOUND");
  });

  it("renders the lesson header, a JSON textarea pre-filled with content, and the initial preview", async () => {
    mockGetLessonForAdmin.mockResolvedValue({
      id: "l1",
      courseId: "c1",
      slug: "lesson-1",
      title: "Lesson 1",
      type: "CONCEPT",
      content: [{ type: "markdown", markdown: "Hello preview" }],
    });

    render(await callPage("c1", "l1"));

    expect(screen.getByRole("heading", { name: "Lesson 1" })).toBeInTheDocument();
    expect(screen.getByText(/lesson-1/)).toBeInTheDocument();
    expect(screen.getByText("Hello preview")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue(JSON.stringify([{ type: "markdown", markdown: "Hello preview" }], null, 2));
    expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan" })).toBeInTheDocument();
  });

  it("defaults to an empty content array when the lesson has none yet", async () => {
    mockGetLessonForAdmin.mockResolvedValue({
      id: "l1",
      courseId: "c1",
      slug: "lesson-1",
      title: "Lesson 1",
      type: "CONCEPT",
      content: [],
    });

    render(await callPage("c1", "l1"));

    expect(screen.getByRole("textbox")).toHaveValue("[]");
  });
});
