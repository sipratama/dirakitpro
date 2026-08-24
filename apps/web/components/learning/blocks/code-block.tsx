import type { CodeContentBlock } from "@/features/learning/content-block";

export function CodeBlock({ block }: { block: CodeContentBlock }) {
  return (
    <pre className="overflow-x-auto rounded-card bg-brand-ink p-4 text-small text-brand-cream">
      <code data-language={block.language}>{block.code}</code>
    </pre>
  );
}
