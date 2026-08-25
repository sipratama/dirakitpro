import "server-only";
import { db, lessons, type Lesson } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { LessonNotFoundError } from "./errors";
import { parseLessonContentJson } from "./parse-lesson-content-json";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * CURRICULUM_MANAGEMENT.md §3 — validates fully (parseLessonContentJson)
 * before any DB write, so an invalid submission never touches the stored
 * `content`: all-or-nothing, never a partial save.
 */
export async function updateLessonContent(lessonId: string, rawContentJson: string): Promise<Lesson> {
  if (!UUID_PATTERN.test(lessonId)) throw new LessonNotFoundError();

  const content = parseLessonContentJson(rawContentJson);

  const [updated] = await db.update(lessons).set({ content }).where(eq(lessons.id, lessonId)).returning();
  if (!updated) throw new LessonNotFoundError();
  return updated;
}
