import Link from "next/link";
import { getCuratedGallery } from "@/features/project/get-curated-gallery";

// PROJECT_SHOWCASE.md §3 (PRJ-006) — expected to render empty through all of
// Wave 6 (nothing is APPROVED/FEATURED until Wave 7's admin moderation
// exists). That's not a bug: a calm empty state, not an error.
export default async function ProjectGalleryPage() {
  const gallery = await getCuratedGallery();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Showcase project learner</h1>

      {gallery.length === 0 ? (
        <p className="mt-8 text-body text-neutral-600">Belum ada project yang ditampilkan di sini.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.authorUsername}/${project.slug}`}
              className="flex flex-col gap-2 rounded-card border border-neutral-100 bg-surface p-5 hover:border-brand-amber"
            >
              {project.screenshotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- source URLs are arbitrary (learner-pasted), not a fixed set of next/image remotePatterns
                <img
                  src={project.screenshotUrl}
                  alt={project.title ?? ""}
                  className="aspect-video w-full rounded-control object-cover"
                />
              ) : null}
              <h2 className="text-h3 text-brand-ink">{project.title ?? project.courseTitle}</h2>
              <p className="text-small text-neutral-600">oleh {project.authorDisplayName}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
