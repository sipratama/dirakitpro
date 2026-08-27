// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockGetDashboardCourses = vi.hoisted(() => vi.fn());
const mockRedirect = vi.hoisted(() =>
  vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
);

vi.mock("@dirakitpro/auth", () => ({ getCurrentUser: mockGetCurrentUser }));
vi.mock("@/features/learning/get-dashboard-courses", () => ({ getDashboardCourses: mockGetDashboardCourses }));
vi.mock("next/navigation", () => ({ redirect: mockRedirect }));

const { default: DashboardPage } = await import("./page");

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
  });

  it("redirects to /login when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    await expect(DashboardPage()).rejects.toThrow("REDIRECT:/login");
  });

  it("shows the empty state with a catalog CTA when there are no enrolled courses", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDashboardCourses.mockResolvedValue([]);

    render(await DashboardPage());

    expect(screen.getByText("Kamu belum punya course aktif.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lihat katalog course" })).toHaveAttribute("href", "/courses");
  });

  it("renders Build Progress, current stage, and the Lanjut Merakit CTA for an enrolled course", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDashboardCourses.mockResolvedValue([
      {
        courseId: "c1",
        courseSlug: "rakit-finance-app",
        courseTitle: "Rakit Aplikasi Keuangan Pribadi",
        buildProgress: { completedCount: 1, totalRequired: 2, ratio: 0.5 },
        currentStageName: "Make It Remember",
        resumeLessonSlug: "simpan-data",
      },
    ]);

    render(await DashboardPage());

    expect(screen.getByText("Rakit Aplikasi Keuangan Pribadi")).toBeInTheDocument();
    expect(screen.getByText("50% Build Progress")).toBeInTheDocument();
    expect(screen.getByText("Stage saat ini: Make It Remember")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lanjut Merakit" })).toHaveAttribute(
      "href",
      "/learn/rakit-finance-app/simpan-data",
    );
  });

  it("omits the Lanjut Merakit CTA when the course somehow has no resumable lesson", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    mockGetDashboardCourses.mockResolvedValue([
      {
        courseId: "c1",
        courseSlug: "empty-course",
        courseTitle: "Empty Course",
        buildProgress: { completedCount: 0, totalRequired: 0, ratio: 0 },
        currentStageName: null,
        resumeLessonSlug: null,
      },
    ]);

    render(await DashboardPage());

    expect(screen.queryByRole("button", { name: "Lanjut Merakit" })).not.toBeInTheDocument();
  });
});
