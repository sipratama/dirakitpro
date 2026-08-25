// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetProjectsForModeration = vi.hoisted(() => vi.fn());

vi.mock("@/features/admin/get-projects-for-moderation", () => ({
  getProjectsForModeration: mockGetProjectsForModeration,
}));

const { default: AdminProjectsPage } = await import("./page");

function callPage(status?: string) {
  return AdminProjectsPage({
    params: Promise.resolve({}),
    searchParams: Promise.resolve(status ? { status } : {}),
  });
}

describe("AdminProjectsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults to the UNREVIEWED queue (calls the function with no filter override)", async () => {
    mockGetProjectsForModeration.mockResolvedValue([]);

    render(await callPage());

    expect(mockGetProjectsForModeration).toHaveBeenCalledWith(undefined);
    expect(screen.getByText("Tidak ada project yang menunggu moderasi.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lihat semua status" })).toHaveAttribute("href", "/admin/projects?status=ALL");
  });

  it("shows every status when the toggle is active (status=ALL calls the function with null)", async () => {
    mockGetProjectsForModeration.mockResolvedValue([]);

    render(await callPage("ALL"));

    expect(mockGetProjectsForModeration).toHaveBeenCalledWith(null);
    expect(screen.getByText("Belum ada project.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lihat yang belum ditinjau" })).toHaveAttribute("href", "/admin/projects");
  });

  it("renders a row per project with learner, course, status, featured, and a link to detail", async () => {
    mockGetProjectsForModeration.mockResolvedValue([
      {
        id: "p1",
        title: "Personal Website Saya",
        courseTitle: "Rakitan Pertama",
        learnerDisplayName: "Budi",
        moderationStatus: "UNREVIEWED",
        isFeatured: false,
      },
    ]);

    render(await callPage());

    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("Rakitan Pertama")).toBeInTheDocument();
    expect(screen.getByText("Personal Website Saya")).toBeInTheDocument();
    expect(screen.getByText("Belum ditinjau")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Detail" })).toHaveAttribute("href", "/admin/projects/p1");
  });
});
