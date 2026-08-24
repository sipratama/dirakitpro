// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownBlock } from "./markdown-block";

describe("MarkdownBlock", () => {
  it("renders markdown content as formatted output", () => {
    render(<MarkdownBlock block={{ type: "markdown", markdown: "**Halo** dunia" }} />);
    expect(screen.getByText("Halo")).toBeInTheDocument();
    expect(screen.getByText("dunia")).toBeInTheDocument();
  });
});
