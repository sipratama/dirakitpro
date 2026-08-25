import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getProjectForModeration } from "@/features/admin/get-project-for-moderation";
import { moderateProjectAction, toggleProjectFeaturedAction } from "./actions";

const MODERATION_LABEL: Record<string, string> = {
  UNREVIEWED: "Belum ditinjau",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  HIDDEN: "Disembunyikan",
};

const textareaClass =
  "w-full rounded-control border border-neutral-300 bg-surface px-3 py-2 text-body text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-teal";

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

// ADMIN_CORE.md §6 — full read view (same content a visitor sees publicly)
// plus the moderation panel. Every action here is a thin form bound to the
// Fase 2 functions — no moderation logic re-implemented on this page.
export default async function AdminProjectDetailPage({ params }: PageProps<"/admin/projects/[projectId]">) {
  const { projectId } = await params;
  const project = await getProjectForModeration(projectId);
  if (!project) notFound();

  const title = project.title ?? project.courseTitle;
  const features = asStringArray(project.features);
  const technologies = asStringArray(project.technologies);

  const approveAction = moderateProjectAction.bind(null, projectId, "APPROVE");
  const rejectAction = moderateProjectAction.bind(null, projectId, "REJECT");
  const hideAction = moderateProjectAction.bind(null, projectId, "HIDE");
  const featureAction = toggleProjectFeaturedAction.bind(null, projectId, true);
  const unfeatureAction = toggleProjectFeaturedAction.bind(null, projectId, false);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <p className="text-small text-neutral-600">
        {project.learnerDisplayName} ({project.learnerUsername}) — {project.courseTitle}
      </p>
      <h1 className="mt-1 text-h1 text-brand-ink">{title}</h1>

      {project.screenshotUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- source URLs are arbitrary (learner-pasted), not a fixed set of next/image remotePatterns
        <img src={project.screenshotUrl} alt={title} className="mt-4 w-full rounded-card border border-neutral-100" />
      )}

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

      <div className="mt-10 border-t border-neutral-100 pt-6">
        <h2 className="text-h3 text-brand-ink">Moderasi</h2>
        <p className="mt-1 text-small text-neutral-600">
          Status saat ini: {MODERATION_LABEL[project.moderationStatus]}
          {project.moderationReason ? ` — ${project.moderationReason}` : ""}
        </p>

        <form action={approveAction} className="mt-4">
          <Button type="submit">Approve</Button>
        </form>

        <form action={rejectAction} className="mt-4 flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-small font-medium text-brand-ink">Alasan (wajib untuk Reject)</span>
            <textarea name="reason" rows={2} required className={textareaClass} />
          </label>
          <Button type="submit" variant="destructive">
            Reject
          </Button>
        </form>

        <form action={hideAction} className="mt-4 flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-small font-medium text-brand-ink">Alasan (wajib untuk Hide)</span>
            <textarea name="reason" rows={2} required className={textareaClass} />
          </label>
          <Button type="submit" variant="destructive">
            Hide
          </Button>
        </form>

        <div className="mt-6">
          <h3 className="text-small font-medium text-brand-ink">Featured</h3>
          {project.isFeatured ? (
            <form action={unfeatureAction} className="mt-2">
              <Button type="submit" variant="outline">
                Un-feature
              </Button>
            </form>
          ) : (
            <form action={featureAction} className="mt-2">
              <Button type="submit" variant="outline" disabled={project.moderationStatus !== "APPROVED"}>
                Jadikan Featured
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
