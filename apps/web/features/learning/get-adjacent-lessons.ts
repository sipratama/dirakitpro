import "server-only";
import { courseStages, db, lessons, type Lesson } from "@dirakitpro/database";
import { eq } from "drizzle-orm";

export type AdjacentLessons = { previous: Lesson | null; next: Lesson | null };

/**
 * Prev/next lesson navigation (§3.1 footer) in the same stage → position
 * order used everywhere else in this domain (get-resume-lesson.ts).
 */
export async function getAdjacentLessons(courseId: string, lessonId: string): Promise<AdjacentLessons> {
  const ordered = await db
    .select({ lesson: lessons })
    .from(lessons)
    .innerJoin(courseStages, eq(lessons.courseStageId, courseStages.id))
    .where(eq(lessons.courseId, courseId))
    .orderBy(courseStages.position, lessons.position);

  const index = ordered.findIndex((row) => row.lesson.id === lessonId);
  if (index === -1) return { previous: null, next: null };

  return {
    previous: index > 0 ? ordered[index - 1]!.lesson : null,
    next: index < ordered.length - 1 ? ordered[index + 1]!.lesson : null,
  };
}
