import ReactMarkdown from "react-markdown";
import type { MarkdownContentBlock } from "@/features/learning/content-block";

export function MarkdownBlock({ block }: { block: MarkdownContentBlock }) {
  return (
    <div className="text-body-lg text-brand-ink [&_a]:underline [&_li]:ml-4 [&_li]:list-disc">
      <ReactMarkdown>{block.markdown}</ReactMarkdown>
    </div>
  );
}
