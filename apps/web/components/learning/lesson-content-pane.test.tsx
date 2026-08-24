// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockMarkLessonCompleteAction = vi.hoisted(() => vi.fn(() => Promise.resolve()));

vi.mock("@/app/learn/[courseSlug]/[lessonSlug]/actions", () => ({
  markLessonCompleteAction: mockMarkLessonCompleteAction,
}));

const { LessonContentPane } = await import("./lesson-content-pane");

const TASK_BLOCK = [{ type: "task", items: [{ id: "t1", label: "Deploy ke Vercel" }] }];

describe("LessonContentPane", () => {
  it("keeps 'Tandai selesai' enabled for a non-CHECKPOINT lesson regardless of task state", () => {
    render(
      <LessonContentPane
        blocks={TASK_BLOCK}
        courseSlug="course-1"
        lessonSlug="lesson-1"
        isCheckpoint={false}
        hasTaskBlock={true}
        isCompleted={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Tandai selesai" })).not.toBeDisabled();
  });

  it("disables 'Tandai selesai' for a CHECKPOINT lesson until every task item is checked", () => {
    render(
      <LessonContentPane
        blocks={TASK_BLOCK}
        courseSlug="course-1"
        lessonSlug="lesson-1"
        isCheckpoint={true}
        hasTaskBlock={true}
        isCompleted={false}
      />,
    );

    const button = screen.getByRole("button", { name: "Tandai selesai" });
    expect(button).toBeDisabled();

    fireEvent.click(screen.getByLabelText("Deploy ke Vercel"));
    expect(button).not.toBeDisabled();
  });

  it("keeps 'Tandai selesai' enabled for a CHECKPOINT lesson that has no task block at all", () => {
    render(
      <LessonContentPane
        blocks={[{ type: "markdown", markdown: "Just instructions" }]}
        courseSlug="course-1"
        lessonSlug="lesson-1"
        isCheckpoint={true}
        hasTaskBlock={false}
        isCompleted={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Tandai selesai" })).not.toBeDisabled();
  });

  it("shows a disabled 'Selesai ditandai' state once the lesson is already completed", () => {
    render(
      <LessonContentPane
        blocks={[]}
        courseSlug="course-1"
        lessonSlug="lesson-1"
        isCheckpoint={false}
        hasTaskBlock={false}
        isCompleted={true}
      />,
    );

    const button = screen.getByRole("button", { name: "Selesai ditandai" });
    expect(button).toBeDisabled();
  });
});
