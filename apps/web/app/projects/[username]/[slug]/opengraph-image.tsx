import { ImageResponse } from "next/og";
import { getPublicProject } from "@/features/project/get-public-project";

export const alt = "DirakitPro project showcase";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// PRJ-010 — dynamic OG image per project (title + screenshot). Falls back to
// a generic DirakitPro card if the project is gone/private by the time a
// crawler hits this route directly (it's its own route segment, reachable
// independent of page.tsx's notFound()).
export default async function Image({ params }: { params: Promise<{ username: string; slug: string }> }) {
  const { username, slug } = await params;
  const project = await getPublicProject(username, slug);
  const title = project?.title ?? project?.courseTitle ?? "DirakitPro";

  return new ImageResponse(
    (
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", backgroundColor: "#2B2620" }}>
        {project?.screenshotUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- satori/ImageResponse rendering, not a browser DOM image
          <img
            src={project.screenshotUrl}
            alt=""
            width={size.width}
            height={size.height}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: 64,
            background: "linear-gradient(to top, rgba(43,38,32,0.95), rgba(43,38,32,0))",
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 700, color: "#FDF7EF" }}>{title}</div>
          <div style={{ fontSize: 28, color: "#FCE9C7" }}>Dibangun di DirakitPro</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
