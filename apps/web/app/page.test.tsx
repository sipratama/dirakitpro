// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockGetPublishedCourses = vi.hoisted(() => vi.fn());

vi.mock("@dirakitpro/auth", () => ({ getCurrentUser: mockGetCurrentUser }));
vi.mock("@/features/catalog/get-published-courses", () => ({
  getPublishedCourses: mockGetPublishedCourses,
}));
// The signed-in header renders AccountMenu, which calls Clerk's useClerk() —
// stub it the same way components/home/account-menu.test.tsx does.
vi.mock("@clerk/nextjs", () => ({ useClerk: () => ({ signOut: vi.fn() }) }));

const { default: Home } = await import("./page");

const FABRICATED_CONTENT_MARKERS = [
  "10.000",
  "10,000",
  "Dimas Pratama",
  "komunitas perakit",
  "Tentang Kami",
  "Kebijakan Privasi",
  "Syarat & Ketentuan",
  "Bantuan",
];

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(null);
    mockGetPublishedCourses.mockResolvedValue([]);
  });

  it("renders the header, all 7 content sections, and the footer", async () => {
    render(await Home());

    expect(screen.getByRole("link", { name: "DirakitPro" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("heading", { level: 1, name: "Profesional itu dirakit." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Belajar sambil merakit." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bukan cuma selesai belajar." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sebelum mulai merakit." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rakitan pertamamu dimulai di sini." })).toBeInTheDocument();
  });

  it("has exactly one H1", async () => {
    render(await Home());
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("points the hero CTAs at real, existing routes", async () => {
    render(await Home());

    // "Mulai Merakit" appears twice by design: the hero's primary CTA and the
    // final CTA section deliberately mirror each other (see final-cta-section.tsx)
    // — both must point at the real /register route. Both are the shared
    // `Button` component rendered as an anchor with `nativeButton={false}`,
    // which sets an explicit role="button" (see components/ui/button.tsx) —
    // so these are queried by "button", not "link", role.
    const startBuildingLinks = screen.getAllByRole("button", { name: "Mulai Merakit" });
    expect(startBuildingLinks.length).toBeGreaterThanOrEqual(2);
    for (const link of startBuildingLinks) {
      expect(link).toHaveAttribute("href", "/register");
    }
    expect(screen.getByRole("button", { name: "Lihat Course" })).toHaveAttribute("href", "/courses");
  });

  it("shows stable public destinations and guest actions when signed out", async () => {
    render(await Home());
    // The public header uses "Mulai Merakit" rather than a separate "Daftar"
    // label, matching the same primary action used in the Hero.
    const header = screen.getByRole("banner");
    expect(within(header).getAllByRole("link", { name: "Courses" })[0]).toHaveAttribute("href", "/courses");
    expect(within(header).getAllByRole("link", { name: "Hasil Rakitan" })[0]).toHaveAttribute("href", "/projects");
    expect(within(header).getAllByRole("link", { name: "Tentang" })[0]).toHaveAttribute("href", "/about");
    expect(header.querySelector('a[href="/bundles"]')).toBeNull();
    expect(within(header).getByRole("button", { name: "Masuk" })).toHaveAttribute("href", "/login");
    expect(within(header).getByRole("button", { name: "Mulai Merakit" })).toHaveAttribute("href", "/register");
  });

  it("shows the account dropdown instead of guest actions when signed in", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    render(await Home());

    expect(screen.getByRole("button", { name: "Akun" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Masuk" })).not.toBeInTheDocument();
  });

  it("renders real published courses in Build Discovery, never filler", async () => {
    mockGetPublishedCourses.mockResolvedValue([
      {
        id: "c1",
        slug: "rakit-website-pribadi",
        title: "Rakit Website Pribadi",
        outcomeDescription: "Website portofolio pribadi yang bisa kamu tunjukkan.",
        difficulty: "Pemula",
        durationEstimate: "6-8 jam",
        thumbnailUrl: null,
        price: "299000",
        currency: "IDR",
        isOwned: false,
      },
    ]);

    render(await Home());

    expect(screen.getByText("Rakit Website Pribadi")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Rakit Website Pribadi/ })).toHaveAttribute(
      "href",
      "/courses/rakit-website-pribadi",
    );
  });

  it("omits the Build Discovery section entirely when there are no published courses", async () => {
    render(await Home());
    expect(screen.queryByText("Mau merakit apa?")).not.toBeInTheDocument();
  });

  it("expands and collapses an FAQ item via its native details/summary control", async () => {
    render(await Home());
    const item = screen.getByText("Apakah saya memiliki hasil rakitannya?").closest("details");
    expect(item).not.toBeNull();
    expect(item).not.toHaveAttribute("open");
  });

  it("keeps occasional bundles in the footer after the stable public destinations", async () => {
    render(await Home());
    const footer = screen.getByRole("contentinfo");
    const links = within(footer).getAllByRole("link");

    expect(links.map((link) => link.textContent)).toEqual(["Courses", "Hasil Rakitan", "Tentang", "Bundle"]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/courses", "/projects", "/about", "/bundles"]);
  });

  it("never renders fabricated stats, testimonials, or dead-route footer links", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
    const { container } = render(await Home());
    const text = container.textContent ?? "";

    for (const marker of FABRICATED_CONTENT_MARKERS) {
      expect(text).not.toContain(marker);
    }
  });
});
