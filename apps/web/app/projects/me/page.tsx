import { getCurrentUser } from "@dirakitpro/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getProjectsForUser } from "@/features/project/get-projects-for-user";

const STATUS_LABEL: Record<string, string> = { DRAFT: "Draft", SUBMITTED: "Submitted" };

// PROJECT_SHOWCASE.md §1 (PRJ-001) — one row per Project, auto-created per ACTIVE
// enrollment; a learner with any enrollment never sees an empty state here.
export default async function MyProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projectList = await getProjectsForUser(user.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Project saya</h1>

      {projectList.length === 0 ? (
        <div className="mt-8 flex flex-col items-start gap-4 rounded-card border border-neutral-100 bg-surface p-6">
          <p className="text-body text-neutral-600">Kamu belum punya course aktif.</p>
          <Button render={<Link href="/courses" />}>Lihat katalog course</Button>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {projectList.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/me/${project.id}`}
                className="block rounded-card border border-neutral-100 bg-surface p-5 hover:border-brand-amber"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-h3 text-brand-ink">{project.title ?? project.courseTitle}</p>
                  <div className="flex shrink-0 gap-2">
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-micro text-neutral-600">
                      {STATUS_LABEL[project.status]}
                    </span>
                    {project.visibility === "PUBLIC" && (
                      <span className="rounded-full bg-brand-teal-tint px-3 py-1 text-micro text-brand-teal-text">
                        Publik
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-small text-neutral-600">{project.courseTitle}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
