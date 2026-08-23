import { describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.fn();

vi.mock("./get-current-user", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

const { requireAdmin } = await import("./require-admin");
const { AuthenticationError, ForbiddenError } = await import("./errors");

describe("requireAdmin", () => {
  it("rejects when there is no session", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    await expect(requireAdmin()).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("rejects a LEARNER role user", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "u1", role: "LEARNER" });

    await expect(requireAdmin()).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("allows an ADMIN role user through", async () => {
    const admin = { id: "u2", role: "ADMIN" };
    mockGetCurrentUser.mockResolvedValue(admin);

    await expect(requireAdmin()).resolves.toEqual(admin);
  });
});
