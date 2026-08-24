// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskBlock } from "./task-block";

const BLOCK = {
  type: "task" as const,
  items: [
    { id: "t1", label: "Buat repo" },
    { id: "t2", label: "Deploy ke Vercel" },
  ],
};

describe("TaskBlock", () => {
  it("renders one checkbox per item, all unchecked initially", () => {
    render(<TaskBlock block={BLOCK} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    checkboxes.forEach((checkbox) => expect(checkbox).not.toBeChecked());
  });

  it("reports allComplete=false while only some items are checked, true once every item is checked", () => {
    const onAllCompleteChange = vi.fn();
    render(<TaskBlock block={BLOCK} onAllCompleteChange={onAllCompleteChange} />);

    fireEvent.click(screen.getByLabelText("Buat repo"));
    expect(onAllCompleteChange).toHaveBeenLastCalledWith(false);

    fireEvent.click(screen.getByLabelText("Deploy ke Vercel"));
    expect(onAllCompleteChange).toHaveBeenLastCalledWith(true);
  });

  it("reports allComplete=false again after unchecking a previously-checked item", () => {
    const onAllCompleteChange = vi.fn();
    render(<TaskBlock block={BLOCK} onAllCompleteChange={onAllCompleteChange} />);

    fireEvent.click(screen.getByLabelText("Buat repo"));
    fireEvent.click(screen.getByLabelText("Deploy ke Vercel"));
    fireEvent.click(screen.getByLabelText("Buat repo"));

    expect(onAllCompleteChange).toHaveBeenLastCalledWith(false);
  });
});
