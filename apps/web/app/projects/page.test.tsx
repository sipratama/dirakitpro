// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCuratedGallery = vi.hoisted(() => vi.fn());

vi.mock("@/features/project/get-curated-gallery", () => ({ getCuratedGallery: mockGetCuratedGallery }));

const { default: ProjectGalleryPage } = await import("./page");

describe("ProjectGalleryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a calm empty state (not an error) when nothing is curated yet (expected through Wave 6)", async () => {
    mockGetCuratedGallery.mockResolvedValue([]);

    render(await ProjectGalleryPage());

    expect(screen.getByText("Belum ada project yang ditampilkan di sini.")).toBeInTheDocument();
  });

  it("renders each curated project linking to its public showcase route", async () => {
    mockGetCuratedGallery.mockResolvedValue([
      {
        id: "p1",
        slug: "personal-website-saya",
        title: "Personal Website Saya",
        screenshotUrl: "https://placehold.co/800x600",
        authorUsername: "budi",
        authorDisplayName: "Budi",
      },
    ]);

    render(await ProjectGalleryPage());

    expect(screen.getByText("Personal Website Saya")).toBeInTheDocument();
    expect(screen.getByText("oleh Budi")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/projects/budi/personal-website-saya");
  });
});
