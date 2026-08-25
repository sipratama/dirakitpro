import "server-only";
import { courseStages, db, lessons } from "@dirakitpro/database";
import { count, eq } from "drizzle-orm";
import { CourseStageNotEmptyError, CourseStageNotFoundError } from "./errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * ADM-003 — rejects if the stage still has lessons (see CourseStageNotEmptyError
 * for why this doesn't cascade even though the DB FK would allow it).
 */
export async function deleteCourseStage(stageId: string): Promise<void> {
  if (!UUID_PATTERN.test(stageId)) throw new CourseStageNotFoundError();

  const [existing] = await db.select({ id: courseStages.id }).from(courseStages).where(eq(courseStages.id, stageId)).limit(1);
  if (!existing) throw new CourseStageNotFoundError();

  const [{ value: lessonCount }] = await db.select({ value: count() }).from(lessons).where(eq(lessons.courseStageId, stageId));
  if (lessonCount > 0) throw new CourseStageNotEmptyError();

  await db.delete(courseStages).where(eq(courseStages.id, stageId));
}
