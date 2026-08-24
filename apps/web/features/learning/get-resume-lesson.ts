import "server-only";
import { courseStages, db, lessonProgress, lessons, type Lesson } from "@dirakitpro/database";
import { and, eq, inArray } from "drizzle-orm";

/**
 * LEARNING_WORKSPACE.md §1 resume logic ("Lanjut Merakit"): the first lesson,
 * in stage → lesson position order, that is not yet COMPLETED for this user.
 * If every lesson is already COMPLETED, returns the last lesson instead of
 * null — course completion (10.7) is what signals "fully done"; this helper
 * doesn't need a special case for it.
 */
export async function getResumeLesson(userId: string, courseId: string): Promise<Lesson | null> {
  const orderedLessons = await db
    .select({ lesson: lessons })
    .from(lessons)
    .innerJoin(courseStages, eq(lessons.courseStageId, courseStages.id))
    .where(eq(lessons.courseId, courseId))
    .orderBy(courseStages.position, lessons.position);

  if (orderedLessons.length === 0) return null;

  const lessonIds = orderedLessons.map((row) => row.lesson.id);
  const progressRows = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, lessonIds)));

  const completedIds = new Set(
    progressRows.filter((row) => row.status === "COMPLETED").map((row) => row.lessonId),
  );

  const firstIncomplete = orderedLessons.find((row) => !completedIds.has(row.lesson.id));
  if (firstIncomplete) return firstIncomplete.lesson;

  return orderedLessons[orderedLessons.length - 1]!.lesson;
}
