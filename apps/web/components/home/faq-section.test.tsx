// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FaqSection } from "./faq-section";

describe("FaqSection", () => {
  it("renders each question as a closed native details/summary control", () => {
    const { container } = render(<FaqSection />);

    const items = container.querySelectorAll("details");
    expect(items.length).toBeGreaterThan(0);
    for (const details of items) {
      expect((details as HTMLDetailsElement).open).toBe(false);
    }
  });

  it("expands an item's answer on click and keeps it keyboard-operable", () => {
    render(<FaqSection />);

    const summary = screen.getByText("Apakah saya memiliki hasil rakitannya?");
    const details = summary.closest("details") as HTMLDetailsElement;
    expect(details.open).toBe(false);

    fireEvent.click(summary);
    expect(details.open).toBe(true);
    expect(screen.getByText(/proyek yang kamu rakit adalah milikmu/i)).toBeVisible();
  });

  it("never claims a community/mentoring feature that doesn't exist in the product", () => {
    const { container } = render(<FaqSection />);
    expect(container.textContent ?? "").not.toContain("komunitas perakit");
  });
});
