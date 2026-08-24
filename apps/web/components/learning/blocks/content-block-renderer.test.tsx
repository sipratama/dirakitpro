// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContentBlockRenderer } from "./content-block-renderer";

describe("ContentBlockRenderer", () => {
  it("renders each block type in array order", () => {
    render(
      <ContentBlockRenderer
        blocks={[
          { type: "markdown", markdown: "Halo" },
          { type: "code", language: "ts", code: "const x = 1;" },
          { type: "image", url: "https://example.com/a.png", alt: "Gambar" },
          { type: "video", provider: "youtube", videoId: "abc123" },
          { type: "resource_link", label: "Repo", url: "https://github.com/x/y" },
          { type: "task", items: [{ id: "t1", label: "Selesaikan build" }] },
        ]}
      />,
    );

    expect(screen.getByText("Halo")).toBeInTheDocument();
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
    expect(screen.getByAltText("Gambar")).toBeInTheDocument();
    expect(screen.getByTitle("Video lesson")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Repo" })).toBeInTheDocument();
    expect(screen.getByLabelText("Selesaikan build")).toBeInTheDocument();
  });

  it("renders a safe fallback for an unrecognized block type instead of crashing the whole pane", () => {
    render(
      <ContentBlockRenderer
        blocks={[
          { type: "markdown", markdown: "Sebelum" },
          { type: "future_block_type", someField: "x" },
          { type: "markdown", markdown: "Sesudah" },
        ]}
      />,
    );

    expect(screen.getByText("Sebelum")).toBeInTheDocument();
    expect(screen.getByText("Sesudah")).toBeInTheDocument();
    expect(screen.getByText("Konten tidak dapat ditampilkan.")).toBeInTheDocument();
  });

  it("renders a safe fallback for malformed (non-object / missing type) block data", () => {
    render(<ContentBlockRenderer blocks={[null, "just a string", { noType: true }]} />);
    expect(screen.getAllByText("Konten tidak dapat ditampilkan.")).toHaveLength(3);
  });

  it("treats a non-array blocks value as empty rather than crashing", () => {
    render(<ContentBlockRenderer blocks={undefined} />);
    expect(screen.queryByText("Konten tidak dapat ditampilkan.")).not.toBeInTheDocument();
  });

  it("wires onTaskAllCompleteChange through to the rendered task block", () => {
    const onTaskAllCompleteChange = vi.fn();
    render(
      <ContentBlockRenderer
        blocks={[{ type: "task", items: [{ id: "t1", label: "Selesaikan build" }] }]}
        onTaskAllCompleteChange={onTaskAllCompleteChange}
      />,
    );

    screen.getByLabelText("Selesaikan build").click();
    expect(onTaskAllCompleteChange).toHaveBeenCalledWith(true);
  });
});
