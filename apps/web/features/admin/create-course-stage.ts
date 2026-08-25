import "server-only";
import { courseStages, db, type CourseStage } from "@dirakitpro/database";
import { count, eq } from "drizzle-orm";

/** ADM-003 — appends a new stage at the end of the course's current stage order. */
export async function createCourseStage(courseId: string, title: string): Promise<CourseStage> {
  const [{ value: stageCount }] = await db
    .select({ value: count() })
    .from(courseStages)
    .where(eq(courseStages.courseId, courseId));

  const [created] = await db
    .insert(courseStages)
    .values({ courseId, title, position: stageCount + 1 })
    .returning();
  return created;
}
