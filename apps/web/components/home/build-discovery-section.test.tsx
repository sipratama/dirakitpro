// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BuildDiscoverySection } from "./build-discovery-section";
import type { CourseWithOwnership } from "@/features/catalog/get-published-courses";

function makeCourse(overrides: Partial<CourseWithOwnership>): CourseWithOwnership {
  return {
    id: "course-id",
    slug: "course-slug",
    title: "Course Title",
    outcomeDescription: "Outcome description.",
    description: "Full description.",
    difficulty: "Pemula",
    durationEstimate: "6-8 jam",
    thumbnailUrl: null,
    status: "PUBLISHED",
    price: "0",
    currency: "IDR",
    resources: [],
    publishedAt: new Date("2026-01-01"),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    isOwned: false,
    ...overrides,
  };
}

describe("BuildDiscoverySection", () => {
  it("renders nothing when there are no published courses", () => {
    const { container } = render(<BuildDiscoverySection courses={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders exactly the real courses in the DOM with an 80ms stagger", () => {
    const { container } = render(
      <BuildDiscoverySection
        courses={[makeCourse({ id: "1", slug: "a", title: "Course A" }), makeCourse({ id: "2", slug: "b", title: "Course B" })]}
      />,
    );

    expect(screen.getByText("Course A")).toBeInTheDocument();
    expect(screen.getByText("Course B")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(2);

    expect(container.querySelector("section")).toHaveClass("bg-surface");
    const reveals = container.querySelectorAll<HTMLElement>(".dp-css-reveal");
    expect([...reveals].map((reveal) => reveal.style.animationDelay)).toEqual(["0ms", "80ms"]);
  });

  it("caps the grid at 3 courses even when more are published", () => {
    const courses = Array.from({ length: 5 }, (_, i) =>
      makeCourse({ id: String(i), slug: `course-${i}`, title: `Course ${i}` }),
    );

    render(<BuildDiscoverySection courses={courses} />);
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("shows Gratis for a free course instead of a formatted price", () => {
    render(<BuildDiscoverySection courses={[makeCourse({ price: "0" })]} />);
    expect(screen.getByText("Gratis")).toBeInTheDocument();
  });
});
