import "server-only";
import { courseStages, db, lessonProgress, lessons, type Lesson } from "@dirakitpro/database";
import { and, eq, inArray } from "drizzle-orm";

export type WorkspaceLesson = {
  id: string;
  slug: string;
  title: string;
  type: Lesson["type"];
  isRequired: boolean;
  progressStatus: "NOT_STARTED" | "STARTED" | "COMPLETED";
};

export type WorkspaceStage = {
  id: string;
  title: string;
  position: number;
  lessons: WorkspaceLesson[];
};

/**
 * Full curriculum outline for the workspace sidebar/overview (LRN-002,
 * LEARNING_WORKSPACE.md §2/§3.1) — unlike catalog's
 * getCourseCurriculumSummary, this includes each lesson's per-user
 * LessonProgress status (small/secondary signal — Build Progress is the
 * dominant one, BLD-003) and is not gated on the course being PUBLISHED.
 */
export async function getCourseWorkspaceOutline(userId: string, courseId: string): Promise<WorkspaceStage[]> {
  const [stageRows, lessonRows] = await Promise.all([
    db.select().from(courseStages).where(eq(courseStages.courseId, courseId)).orderBy(courseStages.position),
    db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(lessons.position),
  ]);

  const progressRows = lessonRows.length
    ? await db
        .select()
        .from(lessonProgress)
        .where(
          and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, lessonRows.map((row) => row.id))),
        )
    : [];
  const progressByLessonId = new Map(progressRows.map((row) => [row.lessonId, row.status]));

  const lessonsByStageId = new Map<string, WorkspaceLesson[]>();
  for (const lesson of lessonRows) {
    const entry: WorkspaceLesson = {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      type: lesson.type,
      isRequired: lesson.isRequired,
      progressStatus: progressByLessonId.get(lesson.id) ?? "NOT_STARTED",
    };
    const list = lessonsByStageId.get(lesson.courseStageId) ?? [];
    list.push(entry);
    lessonsByStageId.set(lesson.courseStageId, list);
  }

  return stageRows.map((stage) => ({
    id: stage.id,
    title: stage.title,
    position: stage.position,
    lessons: lessonsByStageId.get(stage.id) ?? [],
  }));
}
