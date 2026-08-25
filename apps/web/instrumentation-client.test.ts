import { afterEach, describe, expect, it, vi } from "vitest";

const mockInit = vi.hoisted(() => vi.fn());

vi.mock("posthog-js", () => ({
  default: { init: mockInit },
}));

const originalKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const originalHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_POSTHOG_KEY = originalKey;
  process.env.NEXT_PUBLIC_POSTHOG_HOST = originalHost;
});

describe("client instrumentation", () => {
  it("initializes PostHog once when both public settings exist", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test";
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://posthog.example.test";

    await import("./instrumentation-client");

    expect(mockInit).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledWith("phc_test", {
      api_host: "https://posthog.example.test",
      autocapture: false,
      capture_pageleave: false,
      capture_pageview: false,
      disable_session_recording: true,
    });
  });

  it("skips initialization when either public setting is missing", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "";
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://posthog.example.test";

    await import("./instrumentation-client");

    expect(mockInit).not.toHaveBeenCalled();
  });

  it("contains an initialization failure so hydration can continue", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test";
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://posthog.example.test";
    mockInit.mockImplementationOnce(() => {
      throw new Error("test failure");
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(import("./instrumentation-client")).resolves.toBeDefined();
    expect(consoleError).toHaveBeenCalledWith("PostHog initialization failed", expect.any(Error));

    consoleError.mockRestore();
  });
});
