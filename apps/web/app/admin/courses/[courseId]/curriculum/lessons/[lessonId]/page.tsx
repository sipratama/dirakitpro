import Link from "next/link";
import { notFound } from "next/navigation";
import { getLessonForAdmin } from "@/features/admin/get-lesson-for-admin";
import { submitLessonContentAction } from "./actions";
import { LessonContentEditor } from "./lesson-content-editor";

export default async function AdminLessonContentPage({
  params,
}: PageProps<"/admin/courses/[courseId]/curriculum/lessons/[lessonId]">) {
  const { courseId, lessonId } = await params;
  const lesson = await getLessonForAdmin(lessonId);
  if (!lesson || lesson.courseId !== courseId) notFound();

  const initialBlocks = Array.isArray(lesson.content) ? lesson.content : [];
  const submitAction = submitLessonContentAction.bind(null, courseId, lessonId);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <p className="text-small text-neutral-600">
        <Link href={`/admin/courses/${courseId}/curriculum`} className="underline">
          ← Curriculum
        </Link>
      </p>
      <h1 className="mt-1 text-h1 text-brand-ink">{lesson.title}</h1>
      <p className="mt-1 text-small text-neutral-600">Slug: {lesson.slug} — Type: {lesson.type}</p>

      <LessonContentEditor
        initialContentJson={JSON.stringify(initialBlocks, null, 2)}
        initialBlocks={initialBlocks}
        submitAction={submitAction}
      />
    </div>
  );
}
