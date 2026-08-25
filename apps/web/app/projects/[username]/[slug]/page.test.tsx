// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetPublicProject = vi.hoisted(() => vi.fn());
const mockNotFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
);

vi.mock("@/features/project/get-public-project", () => ({ getPublicProject: mockGetPublicProject }));
vi.mock("next/navigation", () => ({ notFound: mockNotFound }));

const { default: PublicProjectPage, generateMetadata } = await import("./page");

function callPage(username: string, slug: string) {
  return PublicProjectPage({ params: Promise.resolve({ username, slug }), searchParams: Promise.resolve({}) });
}

function callMetadata(username: string, slug: string) {
  return generateMetadata({ params: Promise.resolve({ username, slug }), searchParams: Promise.resolve({}) });
}

const BASE_PROJECT = {
  id: "p1",
  slug: "personal-website-saya",
  title: "Personal Website Saya",
  description: "Website portofolio pribadi",
  features: ["Responsive"],
  technologies: ["HTML"],
  liveUrl: "https://example.com",
  screenshotUrl: "https://placehold.co/800x600",
  authorUsername: "budi",
  authorDisplayName: "Budi",
  courseTitle: "Rakitan Pertama",
  indexable: false,
};

describe("PublicProjectPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
  });

  it("404s when the project is null (PRIVATE, HIDDEN, REJECTED, or nonexistent)", async () => {
    mockGetPublicProject.mockResolvedValue(null);
    await expect(callPage("budi", "personal-website-saya")).rejects.toThrow("NOT_FOUND");
  });

  it("renders title, author, description, features, technologies, and the live URL", async () => {
    mockGetPublicProject.mockResolvedValue(BASE_PROJECT);

    render(await callPage("budi", "personal-website-saya"));

    expect(screen.getByRole("heading", { name: "Personal Website Saya" })).toBeInTheDocument();
    expect(screen.getByText("oleh Budi")).toBeInTheDocument();
    expect(screen.getByText("Website portofolio pribadi")).toBeInTheDocument();
    expect(screen.getByText("Responsive")).toBeInTheDocument();
    expect(screen.getByText("HTML")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lihat live project/ })).toHaveAttribute("href", "https://example.com");
  });

  it("falls back to the course title when the project has no learner-set title", async () => {
    mockGetPublicProject.mockResolvedValue({ ...BASE_PROJECT, title: null });

    render(await callPage("budi", "personal-website-saya"));

    expect(screen.getByRole("heading", { name: "Rakitan Pertama" })).toBeInTheDocument();
  });

  it("sets robots noindex for a PUBLIC + UNREVIEWED project", async () => {
    mockGetPublicProject.mockResolvedValue({ ...BASE_PROJECT, indexable: false });

    const metadata = await callMetadata("budi", "personal-website-saya");

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("allows indexing for a PUBLIC + APPROVED project", async () => {
    mockGetPublicProject.mockResolvedValue({ ...BASE_PROJECT, indexable: true });

    const metadata = await callMetadata("budi", "personal-website-saya");

    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it("returns empty metadata when the project doesn't resolve", async () => {
    mockGetPublicProject.mockResolvedValue(null);

    const metadata = await callMetadata("budi", "does-not-exist");

    expect(metadata).toEqual({});
  });
});
