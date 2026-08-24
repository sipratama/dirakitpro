import { getCurrentUser } from "@dirakitpro/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ContentBlockRenderer } from "@/components/learning/blocks/content-block-renderer";
import { BuildProgressBar } from "@/components/learning/build-progress-bar";
import { Button } from "@/components/ui/button";
import { getBuildProgress } from "@/features/learning/get-build-progress";
import { getCourseWorkspaceOutline } from "@/features/learning/get-course-workspace-outline";
import { getEnrollmentAccess } from "@/features/learning/get-enrollment-access";
import { getResumeLesson } from "@/features/learning/get-resume-lesson";

const PROGRESS_LABEL: Record<string, string> = {
  COMPLETED: "Selesai",
  STARTED: "Berlangsung",
  NOT_STARTED: "",
};

// LEARNING_WORKSPACE.md §2 — enrolled-only workspace entry (LRN-002, LRN-007).
export default async function CourseWorkspacePage({ params }: PageProps<"/learn/[courseSlug]">) {
  const { courseSlug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // LRN-006: no enrollment is not a 404 — the course exists, the honest
  // state is "you haven't bought this", so it redirects to the public page.
  const access = await getEnrollmentAccess(user.id, courseSlug);
  if (!access) redirect(`/courses/${courseSlug}`);

  const [buildProgress, resumeLesson, outline] = await Promise.all([
    getBuildProgress(user.id, access.course.id),
    getResumeLesson(user.id, access.course.id),
    getCourseWorkspaceOutline(user.id, access.course.id),
  ]);

  const resources = Array.isArray(access.course.resources) ? access.course.resources : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-h1 text-brand-ink">{access.course.title}</h1>

      <div className="mt-4">
        <BuildProgressBar ratio={buildProgress.ratio} />
      </div>

      {resumeLesson && (
        <div className="mt-6">
          <Button render={<Link href={`/learn/${courseSlug}/${resumeLesson.slug}`} />}>Lanjut Merakit</Button>
        </div>
      )}

      <div className="mt-10 flex flex-col gap-6">
        {outline.map((stage) => (
          <div key={stage.id}>
            <h2 className="text-h3 text-brand-ink">{stage.title}</h2>
            <ul className="mt-2 flex flex-col gap-1">
              {stage.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/learn/${courseSlug}/${lesson.slug}`}
                    className="flex items-center justify-between rounded-card px-2 py-1 text-body text-brand-ink hover:bg-neutral-50"
                  >
                    <span>{lesson.title}</span>
                    <span className="text-small text-neutral-600">{PROGRESS_LABEL[lesson.progressStatus]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {resources.length > 0 && (
        <div className="mt-10">
          <h2 className="text-h3 text-brand-ink">Resource course</h2>
          <div className="mt-3">
            <ContentBlockRenderer blocks={resources} />
          </div>
        </div>
      )}
    </div>
  );
}
