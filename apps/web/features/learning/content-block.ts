// LRN-004 (Appendix G): lesson `content` and course-level `resources` are both
// stored as an array of these block types. Array order = render order.

export type MarkdownContentBlock = {
  type: "markdown";
  markdown: string;
};

export type CodeContentBlock = {
  type: "code";
  language: string;
  code: string;
};

export type ImageContentBlock = {
  type: "image";
  url: string;
  alt: string;
  caption?: string;
};

// `provider` is intentionally its own field so a future provider (e.g.
// "cloudflare_stream", Appendix F) only adds a union member + a render case,
// never a schema/type change.
export type VideoContentBlock = {
  type: "video";
  provider: "youtube";
  videoId: string;
};

export type ResourceLinkContentBlock = {
  type: "resource_link";
  label: string;
  url: string;
};

export type TaskItem = {
  id: string;
  label: string;
};

export type TaskContentBlock = {
  type: "task";
  items: TaskItem[];
};

export type ContentBlock =
  | MarkdownContentBlock
  | CodeContentBlock
  | ImageContentBlock
  | VideoContentBlock
  | ResourceLinkContentBlock
  | TaskContentBlock;

const CONTENT_BLOCK_TYPES = new Set<ContentBlock["type"]>([
  "markdown",
  "code",
  "image",
  "video",
  "resource_link",
  "task",
]);

// Shared by ContentBlockRenderer (Wave 5, rendering) and updateLessonContent
// (Wave 7b-ii, admin authoring/validation, CURRICULUM_MANAGEMENT.md §3) — one
// guard, reused rather than redefined, so what the admin editor accepts and
// what the learner-facing renderer can render never drift apart.
export function isContentBlock(value: unknown): value is ContentBlock {
  if (typeof value !== "object" || value === null || !("type" in value)) return false;
  return CONTENT_BLOCK_TYPES.has((value as { type: unknown }).type as ContentBlock["type"]);
}
