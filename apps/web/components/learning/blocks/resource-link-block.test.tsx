// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResourceLinkBlock } from "./resource-link-block";

describe("ResourceLinkBlock", () => {
  it("renders an external link with the given label and url, opened in a new tab", () => {
    render(<ResourceLinkBlock block={{ type: "resource_link", label: "Repo starter", url: "https://github.com/x/y" }} />);
    const link = screen.getByRole("link", { name: "Repo starter" });
    expect(link).toHaveAttribute("href", "https://github.com/x/y");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
