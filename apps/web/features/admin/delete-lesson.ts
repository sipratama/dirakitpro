import "server-only";
import { db, lessons } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { LessonNotFoundError } from "./errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * ADM-003 — direct delete, no "still has X" guard like deleteCourseStage.
 * A single lesson's blast radius (its own LessonProgress rows, cascaded by
 * the DB FK) is small and scoped to one piece of content, unlike a whole
 * stage's worth of lessons — the PRD doesn't ask for a guard here either.
 */
export async function deleteLesson(lessonId: string): Promise<void> {
  if (!UUID_PATTERN.test(lessonId)) throw new LessonNotFoundError();

  const [deleted] = await db.delete(lessons).where(eq(lessons.id, lessonId)).returning({ id: lessons.id });
  if (!deleted) throw new LessonNotFoundError();
}
