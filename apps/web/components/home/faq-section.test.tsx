// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FaqSection } from "./faq-section";

describe("FaqSection", () => {
  it("keeps every question and answer in the DOM with a light stagger", () => {
    const { container } = render(<FaqSection />);

    expect(container.querySelector("section")).toHaveClass("bg-brand-cream");
    const items = container.querySelectorAll("details");
    expect(items).toHaveLength(4);
    for (const details of items) {
      expect((details as HTMLDetailsElement).open).toBe(false);
      expect(details.querySelector("summary")).toBeInTheDocument();
      expect(details.querySelector(".dp-faq-answer")).toBeInTheDocument();
    }

    const reveals = container.querySelectorAll<HTMLElement>(".dp-css-reveal");
    expect([...reveals].map((reveal) => reveal.style.animationDelay)).toEqual(["0ms", "60ms", "120ms", "180ms"]);
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
