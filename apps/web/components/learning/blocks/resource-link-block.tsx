import type { ResourceLinkContentBlock } from "@/features/learning/content-block";

export function ResourceLinkBlock({ block }: { block: ResourceLinkContentBlock }) {
  return (
    <a
      href={block.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-fit items-center gap-2 rounded-card border border-neutral-100 bg-surface px-4 py-3 text-body text-brand-ink underline hover:border-brand-amber"
    >
      {block.label}
    </a>
  );
}
