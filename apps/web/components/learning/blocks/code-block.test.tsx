// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./code-block";

describe("CodeBlock", () => {
  it("renders the code text and exposes the language on the code element", () => {
    render(<CodeBlock block={{ type: "code", language: "ts", code: "const x = 1;" }} />);
    const codeEl = screen.getByText("const x = 1;");
    expect(codeEl.tagName).toBe("CODE");
    expect(codeEl).toHaveAttribute("data-language", "ts");
  });
});
