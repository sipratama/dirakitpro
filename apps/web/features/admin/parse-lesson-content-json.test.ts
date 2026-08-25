import { describe, expect, it } from "vitest";
import { InvalidLessonContentError } from "./errors";
import { parseLessonContentJson } from "./parse-lesson-content-json";

const ALL_SIX_BLOCKS = [
  { type: "markdown", markdown: "# Hi" },
  { type: "code", language: "ts", code: "const x = 1;" },
  { type: "image", url: "https://example.com/a.png", alt: "alt" },
  { type: "video", provider: "youtube", videoId: "abc123" },
  { type: "resource_link", label: "Repo", url: "https://github.com/example/repo" },
  { type: "task", items: [{ id: "1", label: "Do the thing" }] },
];

describe("parseLessonContentJson", () => {
  it("accepts a JSON array containing all 6 known block types", () => {
    const result = parseLessonContentJson(JSON.stringify(ALL_SIX_BLOCKS));
    expect(result).toEqual(ALL_SIX_BLOCKS);
  });

  it("accepts an empty array", () => {
    expect(parseLessonContentJson("[]")).toEqual([]);
  });

  it("accepts a video block with a non-youtube provider (Appendix F: other providers are planned, not rejected)", () => {
    const blocks = [{ type: "video", provider: "vimeo", videoId: "xyz" }];
    expect(parseLessonContentJson(JSON.stringify(blocks))).toEqual(blocks);
  });

  it("rejects invalid JSON", () => {
    expect(() => parseLessonContentJson("{not valid json")).toThrow(InvalidLessonContentError);
  });

  it("rejects a JSON object that isn't an array", () => {
    expect(() => parseLessonContentJson('{"type": "markdown", "markdown": "hi"}')).toThrow(InvalidLessonContentError);
  });

  it("rejects a block with no type field", () => {
    expect(() => parseLessonContentJson('[{"markdown": "hi"}]')).toThrow(InvalidLessonContentError);
  });

  it("rejects a block with an unrecognized type", () => {
    expect(() => parseLessonContentJson('[{"type": "quiz", "question": "?"}]')).toThrow(InvalidLessonContentError);
  });
});
