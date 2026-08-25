// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCoursesForAdmin = vi.hoisted(() => vi.fn());

vi.mock("@/features/admin/get-courses-for-admin", () => ({
  getCoursesForAdmin: mockGetCoursesForAdmin,
}));

const { default: AdminCoursesPage } = await import("./page");

describe("AdminCoursesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a calm empty state and a link to create a new course", async () => {
    mockGetCoursesForAdmin.mockResolvedValue([]);

    render(await AdminCoursesPage());

    expect(screen.getByText("Belum ada course.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ Course baru" })).toHaveAttribute("href", "/admin/courses/new");
  });

  it("renders a row per course with title, slug, status, price, and a link to edit", async () => {
    mockGetCoursesForAdmin.mockResolvedValue([
      { id: "c1", title: "Rakitan Pertama", slug: "rakitan-pertama", status: "DRAFT", price: "0" },
      { id: "c2", title: "Rakit Aplikasi Keuangan", slug: "rakit-aplikasi-keuangan", status: "PUBLISHED", price: "149000" },
    ]);

    render(await AdminCoursesPage());

    expect(screen.getByText("Rakitan Pertama")).toBeInTheDocument();
    expect(screen.getByText("rakitan-pertama")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Gratis")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Edit" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Edit" })[0]).toHaveAttribute("href", "/admin/courses/c1");
  });
});
