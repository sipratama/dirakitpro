// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VideoBlock } from "./video-block";

describe("VideoBlock", () => {
  it("embeds a youtube video by id via the standard embed URL", () => {
    render(<VideoBlock block={{ type: "video", provider: "youtube", videoId: "abc123" }} />);
    expect(screen.getByTitle("Video lesson")).toHaveAttribute("src", "https://www.youtube.com/embed/abc123");
  });
});
