import type { VideoContentBlock } from "@/features/learning/content-block";

// Appendix F: YouTube (unlisted) is the only provider for MVP. `provider` is
// already a discriminant on VideoContentBlock so a future provider (e.g.
// "cloudflare_stream") adds a case here without touching the block's shape.
function renderEmbedUrl(block: VideoContentBlock): string {
  switch (block.provider) {
    case "youtube":
      return `https://www.youtube.com/embed/${block.videoId}`;
  }
}

export function VideoBlock({ block }: { block: VideoContentBlock }) {
  return (
    <div className="aspect-video overflow-hidden rounded-card border border-neutral-100">
      <iframe
        src={renderEmbedUrl(block)}
        title="Video lesson"
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
