import type { ImageContentBlock } from "@/features/learning/content-block";

export function ImageBlock({ block }: { block: ImageContentBlock }) {
  return (
    <figure className="flex flex-col gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- source URLs are arbitrary (R2/CMS), not a fixed set of next/image remotePatterns */}
      <img src={block.url} alt={block.alt} className="rounded-card border border-neutral-100" />
      {block.caption && <figcaption className="text-small text-neutral-600">{block.caption}</figcaption>}
    </figure>
  );
}
