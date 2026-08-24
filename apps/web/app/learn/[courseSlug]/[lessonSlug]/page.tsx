import { getCurrentUser } from "@dirakitpro/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BuildProgressBar } from "@/components/learning/build-progress-bar";
import { LessonContentPane } from "@/components/learning/lesson-content-pane";
import { getAdjacentLessons } from "@/features/learning/get-adjacent-lessons";
import { getBuildProgress } from "@/features/learning/get-build-progress";
import { getCourseWorkspaceOutline } from "@/features/learning/get-course-workspace-outline";
import { getEnrollmentAccess } from "@/features/learning/get-enrollment-access";
import { getLessonBySlug } from "@/features/learning/get-lesson-by-slug";

const PROGRESS_LABEL: Record<string, string> = {
  COMPLETED: "Selesai",
  STARTED: "Berlangsung",
  NOT_STARTED: "",
};

function hasTaskBlock(blocks: unknown[]): boolean {
  return blocks.some((block) => typeof block === "object" && block !== null && (block as { type?: unknown }).type === "task");
}

// LEARNING_WORKSPACE.md §3 — the workspace itself (LRN-002/003/004/005/007, BLD-002/003).
export default async function LessonPage({ params }: PageProps<"/learn/[courseSlug]/[lessonSlug]">) {
  const { courseSlug, lessonSlug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const access = await getEnrollmentAccess(user.id, courseSlug);
  if (!access) redirect(`/courses/${courseSlug}`);

  // §3.4: a lesson that doesn't belong to this course, or doesn't exist, 404s.
  const lesson = await getLessonBySlug(access.course.id, lessonSlug);
  if (!lesson) notFound();

  const [buildProgress, adjacent, outline] = await Promise.all([
    getBuildProgress(user.id, access.course.id),
    getAdjacentLessons(access.course.id, lesson.id),
    getCourseWorkspaceOutline(user.id, access.course.id),
  ]);

  const currentOutlineLesson = outline.flatMap((stage) => stage.lessons).find((row) => row.id === lesson.id);
  const isCompleted = currentOutlineLesson?.progressStatus === "COMPLETED";
  const contentBlocks = Array.isArray(lesson.content) ? lesson.content : [];

  return (
    <div className="flex flex-col lg:flex-row">
      <aside className="w-full shrink-0 border-b border-neutral-100 lg:w-64 lg:border-r lg:border-b-0">
        <nav className="flex flex-col gap-4 p-4">
          {outline.map((stage) => (
            <div key={stage.id}>
              <p className="text-small font-medium text-neutral-600">{stage.title}</p>
              <ul className="mt-1 flex flex-col gap-1">
                {stage.lessons.map((row) => (
                  <li key={row.id}>
                    <Link
                      href={`/learn/${courseSlug}/${row.slug}`}
                      aria-current={row.id === lesson.id ? "page" : undefined}
                      className={`flex items-center justify-between rounded-card px-2 py-1 text-body ${
                        row.id === lesson.id ? "bg-brand-amber-tint text-brand-amber-text" : "text-brand-ink"
                      }`}
                    >
                      <span>{row.title}</span>
                      <span className="text-micro text-neutral-600">{PROGRESS_LABEL[row.progressStatus]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-10 border-b border-neutral-100 bg-surface p-4">
          <BuildProgressBar ratio={buildProgress.ratio} />
          <Link href={`/learn/${courseSlug}`} className="mt-2 inline-block text-small text-brand-ink underline">
            Resource course
          </Link>
        </header>

        <main className="p-6">
          <h1 className="text-h2 text-brand-ink">{lesson.title}</h1>
          <p className="mt-1 text-small text-neutral-600">{lesson.type}</p>

          <div className="mt-6">
            <LessonContentPane
              blocks={contentBlocks}
              courseSlug={courseSlug}
              lessonSlug={lessonSlug}
              isCheckpoint={lesson.type === "CHECKPOINT"}
              hasTaskBlock={hasTaskBlock(contentBlocks)}
              isCompleted={isCompleted}
            />
          </div>

          <div className="mt-10 flex items-center justify-between">
            {adjacent.previous ? (
              <Link href={`/learn/${courseSlug}/${adjacent.previous.slug}`} className="text-body text-brand-ink underline">
                ← {adjacent.previous.title}
              </Link>
            ) : (
              <span />
            )}
            {adjacent.next ? (
              <Link href={`/learn/${courseSlug}/${adjacent.next.slug}`} className="text-body text-brand-ink underline">
                {adjacent.next.title} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
