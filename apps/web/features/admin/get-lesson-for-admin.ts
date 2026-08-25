import "server-only";
import { db, lessons, type Lesson } from "@dirakitpro/database";
import { eq } from "drizzle-orm";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Single-lesson lookup for the content editor (`/admin/courses/[courseId]/curriculum/lessons/[lessonId]`) — same UUID-validate-first guard as getCourseForAdmin/getBundleForAdmin. */
export async function getLessonForAdmin(lessonId: string): Promise<Lesson | null> {
  if (!UUID_PATTERN.test(lessonId)) return null;

  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  return lesson ?? null;
}
