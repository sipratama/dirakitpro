import "server-only";
import { db, lessons, type Lesson } from "@dirakitpro/database";
import { and, eq } from "drizzle-orm";

/**
 * Lesson lookup scoped to a specific course (LEARNING_WORKSPACE.md §3.4: "lesson
 * doesn't belong to this course, or doesn't exist → notFound()"). Scoping by
 * `courseId` in the WHERE clause means a lesson slug from a different course
 * can never resolve here, so the caller's `notFound()` on a null result
 * already covers both "doesn't exist" and "belongs to another course".
 */
export async function getLessonBySlug(courseId: string, lessonSlug: string): Promise<Lesson | null> {
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.courseId, courseId), eq(lessons.slug, lessonSlug)))
    .limit(1);
  return lesson ?? null;
}
