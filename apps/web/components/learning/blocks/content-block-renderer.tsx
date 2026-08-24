import type { ContentBlock } from "@/features/learning/content-block";
import { CodeBlock } from "./code-block";
import { ImageBlock } from "./image-block";
import { MarkdownBlock } from "./markdown-block";
import { ResourceLinkBlock } from "./resource-link-block";
import { TaskBlock } from "./task-block";
import { VideoBlock } from "./video-block";

const BLOCK_TYPES = new Set<ContentBlock["type"]>([
  "markdown",
  "code",
  "image",
  "video",
  "resource_link",
  "task",
]);

function isContentBlock(value: unknown): value is ContentBlock {
  if (typeof value !== "object" || value === null || !("type" in value)) return false;
  return BLOCK_TYPES.has((value as { type: unknown }).type as ContentBlock["type"]);
}

function UnknownBlockFallback() {
  // `content`/`resources` are untyped jsonb at the DB level (LRN-004) — a
  // malformed or future-unknown block must never take down the whole
  // content pane, so this renders instead of throwing.
  return <p className="text-small text-neutral-600">Konten tidak dapat ditampilkan.</p>;
}

export function ContentBlockRenderer({
  blocks,
  onTaskAllCompleteChange,
}: {
  blocks: unknown;
  onTaskAllCompleteChange?: (allComplete: boolean) => void;
}) {
  const list = Array.isArray(blocks) ? blocks : [];

  return (
    <div className="flex flex-col gap-6">
      {list.map((block, index) => {
        if (!isContentBlock(block)) return <UnknownBlockFallback key={index} />;

        switch (block.type) {
          case "markdown":
            return <MarkdownBlock key={index} block={block} />;
          case "code":
            return <CodeBlock key={index} block={block} />;
          case "image":
            return <ImageBlock key={index} block={block} />;
          case "video":
            return <VideoBlock key={index} block={block} />;
          case "resource_link":
            return <ResourceLinkBlock key={index} block={block} />;
          case "task":
            return <TaskBlock key={index} block={block} onAllCompleteChange={onTaskAllCompleteChange} />;
          default:
            return <UnknownBlockFallback key={index} />;
        }
      })}
    </div>
  );
}
