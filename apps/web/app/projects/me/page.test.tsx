// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockGetProjectsForUser = vi.hoisted(() => vi.fn());
const mockRedirect = vi.hoisted(() =>
  vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
);

vi.mock("@dirakitpro/auth", () => ({ getCurrentUser: mockGetCurrentUser }));
vi.mock("@/features/project/get-projects-for-user", () => ({ getProjectsForUser: mockGetProjectsForUser }));
vi.mock("next/navigation", () => ({ redirect: mockRedirect }));

const { default: MyProjectsPage } = await import("./page");

describe("MyProjectsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
  });

  it("redirects to /login when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    await expect(MyProjectsPage()).rejects.toThrow("REDIRECT:/login");
  });

  it("shows the empty state with a catalog CTA when there are no projects", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetProjectsForUser.mockResolvedValue([]);

    render(await MyProjectsPage());

    expect(screen.getByText("Kamu belum punya course aktif.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lihat katalog course" })).toHaveAttribute("href", "/courses");
  });

  it("renders a workflow badge, a visibility badge only when PUBLIC, and a link into the edit page", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetProjectsForUser.mockResolvedValue([
      {
        id: "p1",
        title: null,
        courseTitle: "Rakitan Pertama — Personal Website",
        status: "DRAFT",
        visibility: "PRIVATE",
      },
      {
        id: "p2",
        title: "Aplikasi Keuangan Saya",
        courseTitle: "Rakit Aplikasi Keuangan Pribadi",
        status: "SUBMITTED",
        visibility: "PUBLIC",
      },
    ]);

    render(await MyProjectsPage());

    expect(screen.getByRole("link", { name: /Rakitan Pertama — Personal Website/ })).toHaveAttribute(
      "href",
      "/projects/me/p1",
    );
    expect(screen.getByRole("link", { name: /Aplikasi Keuangan Saya/ })).toHaveAttribute("href", "/projects/me/p2");
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Submitted")).toBeInTheDocument();
    expect(screen.getAllByText("Publik")).toHaveLength(1);
  });
});
