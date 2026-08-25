import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProject } from "@/features/project/get-public-project";
import { ShareActions } from "./share-actions";

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

// PRJ-010 — noindex until APPROVED (PRJ-007). OG image comes from the
// colocated opengraph-image.tsx (Next.js file convention, next/og).
export async function generateMetadata({
  params,
}: PageProps<"/projects/[username]/[slug]">): Promise<Metadata> {
  const { username, slug } = await params;
  const project = await getPublicProject(username, slug);
  if (!project) return {};

  const title = project.title ?? project.courseTitle;
  return {
    title,
    description: project.description ?? undefined,
    robots: { index: project.indexable, follow: project.indexable },
    openGraph: {
      title,
      description: project.description ?? undefined,
      type: "website",
    },
  };
}

// PROJECT_SHOWCASE.md §4 — PRJ-007/008/009/010.
export default async function PublicProjectPage({ params }: PageProps<"/projects/[username]/[slug]">) {
  const { username, slug } = await params;
  const project = await getPublicProject(username, slug);
  if (!project) notFound();

  const title = project.title ?? project.courseTitle;
  const features = asStringArray(project.features);
  const technologies = asStringArray(project.technologies);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      {project.screenshotUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- source URLs are arbitrary (learner-pasted), not a fixed set of next/image remotePatterns
        <img src={project.screenshotUrl} alt={title} className="w-full rounded-card border border-neutral-100" />
      )}

      <h1 className="mt-6 text-h1 text-brand-ink">{title}</h1>
      <p className="mt-1 text-small text-neutral-600">oleh {project.authorDisplayName}</p>

      {project.description && <p className="mt-4 text-body text-neutral-600">{project.description}</p>}

      {features.length > 0 && (
        <div className="mt-6">
          <h2 className="text-h3 text-brand-ink">Fitur</h2>
          <ul className="mt-2 list-disc pl-5 text-body text-neutral-600">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {technologies.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span key={tech} className="rounded-full bg-neutral-100 px-3 py-1 text-micro text-neutral-600">
              {tech}
            </span>
          ))}
        </div>
      )}

      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-body text-brand-teal underline"
        >
          Lihat live project →
        </a>
      )}

      <div className="mt-8">
        <ShareActions title={title} />
      </div>

      <p className="mt-10 text-small text-neutral-600">Dibangun di DirakitPro</p>
    </div>
  );
}
