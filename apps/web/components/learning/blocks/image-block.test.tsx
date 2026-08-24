// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageBlock } from "./image-block";

describe("ImageBlock", () => {
  it("renders the image with its alt text", () => {
    render(<ImageBlock block={{ type: "image", url: "https://example.com/a.png", alt: "Diagram arsitektur" }} />);
    const img = screen.getByAltText("Diagram arsitektur");
    expect(img).toHaveAttribute("src", "https://example.com/a.png");
  });

  it("renders an optional caption", () => {
    render(
      <ImageBlock
        block={{ type: "image", url: "https://example.com/a.png", alt: "Diagram", caption: "Alur data" }}
      />,
    );
    expect(screen.getByText("Alur data")).toBeInTheDocument();
  });

  it("omits the caption element when none is given", () => {
    render(<ImageBlock block={{ type: "image", url: "https://example.com/a.png", alt: "Diagram" }} />);
    expect(screen.queryByRole("figure")?.querySelector("figcaption")).toBeNull();
  });
});
