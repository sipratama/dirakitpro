import { getCurrentUser } from "@dirakitpro/auth";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getProjectForOwner } from "@/features/project/get-project-for-owner";
import { setProjectVisibilityAction, updateProjectSubmissionAction } from "./actions";

const MODERATION_LABEL: Record<string, string> = {
  UNREVIEWED: "Belum ditinjau",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  HIDDEN: "Disembunyikan",
};

const inputClass =
  "w-full rounded-control border border-neutral-300 bg-surface px-3 py-2 text-body text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-teal";

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

// PROJECT_SHOWCASE.md §2 — the most decision-dense screen in this wave:
// submission fields (§2.1), visibility/publication (§2.2), ownership guard
// (§2.3), and read-only moderation display (§2.4).
export default async function EditProjectPage({ params }: PageProps<"/projects/me/[projectId]">) {
  const { projectId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // §2.3: not the owner, or doesn't exist — both 404 the same way.
  const project = await getProjectForOwner(projectId, user.id);
  if (!project) notFound();

  const submitAction = updateProjectSubmissionAction.bind(null, projectId);
  const goPublicAction = setProjectVisibilityAction.bind(null, projectId, "PUBLIC");
  const goPrivateAction = setProjectVisibilityAction.bind(null, projectId, "PRIVATE");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Edit project</h1>
      <p className="mt-1 text-small text-neutral-600">
        Status: {project.status === "SUBMITTED" ? "Submitted" : "Draft"}
      </p>

      <form action={submitAction} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-1">
          <span className="text-small font-medium text-brand-ink">Judul (opsional, default nama course)</span>
          <input name="title" defaultValue={project.title ?? ""} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-small font-medium text-brand-ink">Deskripsi</span>
          <textarea name="description" defaultValue={project.description ?? ""} rows={3} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-small font-medium text-brand-ink">Features (satu per baris)</span>
          <textarea
            name="features"
            defaultValue={asStringArray(project.features).join("\n")}
            rows={3}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-small font-medium text-brand-ink">Technologies (satu per baris)</span>
          <textarea
            name="technologies"
            defaultValue={asStringArray(project.technologies).join("\n")}
            rows={3}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-small font-medium text-brand-ink">Live URL *</span>
          <input name="liveUrl" defaultValue={project.liveUrl ?? ""} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-small font-medium text-brand-ink">Screenshot URL *</span>
          <input name="screenshotUrl" defaultValue={project.screenshotUrl ?? ""} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-small font-medium text-brand-ink">Repository URL</span>
          <input name="repositoryUrl" defaultValue={project.repositoryUrl ?? ""} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-small font-medium text-brand-ink">Notes *</span>
          <textarea name="notes" defaultValue={project.notes ?? ""} rows={3} className={inputClass} />
        </label>
        <Button type="submit">Simpan</Button>
      </form>

      <div className="mt-10 border-t border-neutral-100 pt-6">
        <h2 className="text-h3 text-brand-ink">Visibility</h2>
        <p className="mt-1 text-small text-neutral-600">
          Moderasi: {MODERATION_LABEL[project.moderationStatus]}
          {project.moderationStatus === "REJECTED" && project.moderationReason ? ` — ${project.moderationReason}` : ""}
        </p>

        {project.visibility === "PUBLIC" ? (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-body text-neutral-600">
              Project ini publik — link showcase sudah aktif sekarang
              {project.moderationStatus !== "APPROVED"
                ? ", tapi belum masuk galeri terkurasi sampai ditinjau admin."
                : "."}
            </p>
            <form action={goPrivateAction}>
              <Button type="submit" variant="outline">
                Jadikan privat
              </Button>
            </form>
          </div>
        ) : project.status === "SUBMITTED" ? (
          <form action={goPublicAction} className="mt-4 flex flex-col gap-3">
            <label className="flex items-start gap-2 text-body text-brand-ink">
              <input
                type="checkbox"
                name="declaration"
                required
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand-teal focus:ring-brand-teal"
              />
              Saya menyatakan project ini adalah hasil kerja saya sendiri dan setuju untuk ditampilkan secara publik
              di DirakitPro.
            </label>
            <Button type="submit">Publikasikan</Button>
          </form>
        ) : (
          <p className="mt-4 text-body text-neutral-600">
            Selesaikan submission (live URL, screenshot, notes) dulu untuk bisa dipublikasikan.
          </p>
        )}
      </div>
    </div>
  );
}
