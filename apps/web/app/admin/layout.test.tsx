// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireAdmin = vi.hoisted(() => vi.fn());
const mockNotFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
);

vi.mock("@dirakitpro/auth", () => ({ requireAdmin: mockRequireAdmin }));
vi.mock("next/navigation", () => ({ notFound: mockNotFound }));

const { default: AdminLayout } = await import("./layout");

describe("AdminLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
  });

  it("404s when requireAdmin rejects (no session or non-ADMIN role) — never a 403 that confirms the route exists", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Forbidden"));

    await expect(AdminLayout({ children: <p>secret</p> })).rejects.toThrow("NOT_FOUND");
  });

  it("renders children when requireAdmin resolves", async () => {
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "ADMIN" });

    render(await AdminLayout({ children: <p>admin content</p> }));

    expect(screen.getByText("admin content")).toBeInTheDocument();
  });
});
