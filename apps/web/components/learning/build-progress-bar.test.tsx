// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BuildProgressBar } from "./build-progress-bar";

describe("BuildProgressBar", () => {
  it("renders the ratio as a rounded percentage", () => {
    render(<BuildProgressBar ratio={0.5} />);
    expect(screen.getByText("50% Build Progress")).toBeInTheDocument();
  });

  it("clamps a ratio above 1 to 100%", () => {
    render(<BuildProgressBar ratio={1.4} />);
    expect(screen.getByText("100% Build Progress")).toBeInTheDocument();
  });

  it("clamps a negative ratio to 0%", () => {
    render(<BuildProgressBar ratio={-0.2} />);
    expect(screen.getByText("0% Build Progress")).toBeInTheDocument();
  });
});
