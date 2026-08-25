// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCapture = vi.hoisted(() => vi.fn());

vi.mock("posthog-js", () => ({
  default: { capture: mockCapture },
}));

const { MentoringCta } = await import("./mentoring-cta");

describe("MentoringCta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("captures mentoring interest synchronously without starting an internal mutation", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<MentoringCta />);

    const cta = screen.getByRole("button", { name: "Diskusikan mentoring" });
    expect(cta).toHaveAttribute("href", "#TODO-mentoring-link");
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");

    fireEvent.click(cta);

    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledWith("mentoring_cta_clicked");
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
