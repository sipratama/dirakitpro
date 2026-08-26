// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());

vi.mock("@dirakitpro/auth", () => ({ getCurrentUser: mockGetCurrentUser }));
vi.mock("posthog-js", () => ({
  default: { capture: vi.fn() },
}));

const { default: AboutPage } = await import("./page");

describe("AboutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(null);
  });

  it("renders its two public sections for a guest without an auth guard", async () => {
    const { container } = render(await AboutPage());

    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll("main > section")).toHaveLength(2);
    expect(screen.getByRole("heading", { level: 1, name: "Profesional itu dirakit." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bahas rakitanmu langsung bersama founder." })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("explains the PRO dimensions and presents later tiers only as a roadmap", async () => {
    render(await AboutPage());

    const pro = screen.getByLabelText("Makna PRO");
    expect(within(pro).getByRole("heading", { name: "Professional" })).toBeInTheDocument();
    expect(within(pro).getByRole("heading", { name: "Progress" })).toBeInTheDocument();
    expect(within(pro).getByRole("heading", { name: "Proven" })).toBeInTheDocument();
    expect(screen.getByText(/hanya Build — Rakitan Pertama — yang aktif/)).toBeInTheDocument();
    expect(screen.getByText(/bukan course yang sudah tersedia/)).toBeInTheDocument();
  });

  it("marks both founder-owned mentoring placeholders and opens the CTA externally", async () => {
    render(await AboutPage());

    expect(screen.getByText("RpXXX.XXX–RpXXX.XXX per sesi")).toBeInTheDocument();
    const cta = screen.getByRole("button", { name: "Diskusikan mentoring" });
    expect(cta).toHaveAttribute("href", "#TODO-mentoring-link");
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
  });
});
