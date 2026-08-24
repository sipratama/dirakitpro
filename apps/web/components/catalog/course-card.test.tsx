// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CourseWithOwnership } from "@/features/catalog/get-published-courses";
import { CourseCard } from "./course-card";

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

describe("CourseCard", () => {
  it("renders the ownership badge when isOwned is true", () => {
    render(<CourseCard course={buildCourse({ isOwned: true })} />);
    expect(screen.getByText("Sudah dimiliki")).toBeInTheDocument();
  });

  it("does not render the ownership badge when isOwned is false", () => {
    render(<CourseCard course={buildCourse({ isOwned: false })} />);
    expect(screen.queryByText("Sudah dimiliki")).not.toBeInTheDocument();
  });

  it("shows 'Gratis' for a FREE (price = 0) course instead of a currency amount", () => {
    render(<CourseCard course={buildCourse({ price: "0" })} />);
    expect(screen.getByText("Gratis")).toBeInTheDocument();
  });

  it("links to the course detail route by slug", () => {
    render(<CourseCard course={buildCourse({ slug: "rakit-finance-app" })} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/courses/rakit-finance-app");
  });
});
