import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const mockProtect = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware:
    (handler: (auth: { protect: typeof mockProtect }, request: NextRequest) => unknown) =>
    (request: NextRequest) =>
      handler({ protect: mockProtect }, request),
}));

const { default: proxy } = await import("./proxy");

function requestFor(path: string) {
  return new NextRequest(new URL(path, "https://dirakitpro.test"));
}

// clerkMiddleware's real return type expects a NextFetchEvent second argument;
// the mock above never touches it, so a stub is enough to satisfy the type.
function callProxy(path: string) {
  return proxy(requestFor(path), {} as Parameters<typeof proxy>[1]);
}

describe("proxy route protection (PRD 12.1-12.3, IAM-002)", () => {
  it("does not gate a public route", async () => {
    await callProxy("/courses");
    expect(mockProtect).not.toHaveBeenCalled();
  });

  it("does not gate the public project showcase route", async () => {
    mockProtect.mockClear();
    await callProxy("/projects/someone/their-project");
    expect(mockProtect).not.toHaveBeenCalled();
  });

  it("requires a session for a learner route (12.2)", async () => {
    mockProtect.mockClear();
    await callProxy("/dashboard");
    expect(mockProtect).toHaveBeenCalledTimes(1);
  });

  it("requires a session for an admin route (12.3)", async () => {
    mockProtect.mockClear();
    await callProxy("/admin/courses");
    expect(mockProtect).toHaveBeenCalledTimes(1);
  });

  it("requires a session for a checkout route (12.3)", async () => {
    mockProtect.mockClear();
    await callProxy("/checkout/course/rakitan-pertama");
    expect(mockProtect).toHaveBeenCalledTimes(1);
  });

  it("does not gate the Midtrans webhook endpoint (IAM-002 exception)", async () => {
    mockProtect.mockClear();
    await callProxy("/api/payments/midtrans/webhook");
    expect(mockProtect).not.toHaveBeenCalled();
  });
});
