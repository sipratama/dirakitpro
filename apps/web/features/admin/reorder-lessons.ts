import "server-only";
import { db, lessons } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { ReorderSetMismatchError } from "./errors";

/**
 * ADM-003 — same shape as reorderCourseStages: one transaction, full
 * replacement order, scoped to a single stage's lessons.
 */
export async function reorderLessons(courseStageId: string, orderedLessonIds: string[]): Promise<void> {
  const existing = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.courseStageId, courseStageId));
  const existingIds = new Set(existing.map((row) => row.id));

  if (existingIds.size !== orderedLessonIds.length || orderedLessonIds.some((id) => !existingIds.has(id))) {
    throw new ReorderSetMismatchError();
  }

  await db.transaction(async (tx) => {
    for (const [index, lessonId] of orderedLessonIds.entries()) {
      await tx.update(lessons).set({ position: index + 1 }).where(eq(lessons.id, lessonId));
    }
  });
}
