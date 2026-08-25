import Link from "next/link";
import { getProjectsForModeration } from "@/features/admin/get-projects-for-moderation";

const MODERATION_LABEL: Record<string, string> = {
  UNREVIEWED: "Belum ditinjau",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  HIDDEN: "Disembunyikan",
};

// ADMIN_CORE.md §5 (ADM-007) — default-filtered to the actual queue
// (UNREVIEWED), with a toggle to view all statuses.
export default async function AdminProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  const resolvedSearchParams = await searchParams;
  const showAll = resolvedSearchParams.status === "ALL";
  const projectList = await getProjectsForModeration(showAll ? null : undefined);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-brand-ink">Moderasi project</h1>
        <Link
          href={showAll ? "/admin/projects" : "/admin/projects?status=ALL"}
          className="text-body text-brand-ink underline"
        >
          {showAll ? "Lihat yang belum ditinjau" : "Lihat semua status"}
        </Link>
      </div>

      {projectList.length === 0 ? (
        <p className="mt-6 text-body text-neutral-600">
          {showAll ? "Belum ada project." : "Tidak ada project yang menunggu moderasi."}
        </p>
      ) : (
        <table className="mt-8 w-full text-body text-brand-ink">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-small text-neutral-600">
              <th className="py-2">Learner</th>
              <th className="py-2">Course</th>
              <th className="py-2">Project</th>
              <th className="py-2">Status</th>
              <th className="py-2">Featured</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {projectList.map((project) => (
              <tr key={project.id} className="border-b border-neutral-100">
                <td className="py-2">{project.learnerDisplayName}</td>
                <td className="py-2">{project.courseTitle}</td>
                <td className="py-2">{project.title ?? project.courseTitle}</td>
                <td className="py-2">{MODERATION_LABEL[project.moderationStatus]}</td>
                <td className="py-2">{project.isFeatured ? "Ya" : "-"}</td>
                <td className="py-2">
                  <Link href={`/admin/projects/${project.id}`} className="text-brand-ink underline">
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
