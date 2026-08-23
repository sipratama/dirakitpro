// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BundleCourseWithOwnership } from "@/features/catalog/get-bundle-by-slug";
import { BundleCourseSelector } from "./bundle-course-selector";

function buildCourse(overrides: Partial<BundleCourseWithOwnership> = {}): BundleCourseWithOwnership {
  return {
    id: "course-1",
    slug: "course-1",
    title: "Course 1",
    outcomeDescription: "Outcome",
    description: "Description",
    difficulty: null,
    durationEstimate: null,
    thumbnailUrl: null,
    status: "PUBLISHED",
    price: "149000",
    currency: "IDR",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    alreadyOwned: false,
    ...overrides,
  };
}

describe("BundleCourseSelector", () => {
  it("disables checkout until exactly `selectionCount` courses are selected", () => {
    const courses = [
      buildCourse({ id: "a", title: "Course A" }),
      buildCourse({ id: "b", title: "Course B" }),
      buildCourse({ id: "c", title: "Course C" }),
    ];
    render(
      <BundleCourseSelector
        courses={courses}
        selectionCount={2}
        checkoutDisabled={false}
        checkoutHref="/checkout/bundle/paket-merdeka"
      />,
    );

    expect(screen.getByRole("button", { name: "Beli bundle ini" })).toBeDisabled();

    fireEvent.click(screen.getByText("Course A"));
    expect(screen.getByText("1/2 dipilih")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Beli bundle ini" })).toBeDisabled();

    fireEvent.click(screen.getByText("Course B"));
    expect(screen.getByText("2/2 dipilih")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Beli bundle ini" })).toHaveAttribute(
      "href",
      "/checkout/bundle/paket-merdeka",
    );
  });

  it("does not let an already-owned course be selected", () => {
    const courses = [
      buildCourse({ id: "a", title: "Course A", alreadyOwned: true }),
      buildCourse({ id: "b", title: "Course B" }),
    ];
    render(
      <BundleCourseSelector courses={courses} selectionCount={1} checkoutDisabled={false} checkoutHref="/checkout/bundle/x" />,
    );

    fireEvent.click(screen.getByText("Course A"));
    expect(screen.getByText("0/1 dipilih")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Course A/ })).toBeDisabled();
  });

  it("keeps checkout disabled even at a valid selection count when checkoutDisabled is forced true", () => {
    const courses = [buildCourse({ id: "a", title: "Course A" })];
    render(
      <BundleCourseSelector courses={courses} selectionCount={1} checkoutDisabled={true} checkoutHref="/checkout/bundle/x" />,
    );

    fireEvent.click(screen.getByText("Course A"));
    expect(screen.getByText("1/1 dipilih")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Beli bundle ini" })).toBeDisabled();
  });
});
