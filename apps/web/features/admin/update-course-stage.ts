import "server-only";
import { courseStages, db, type CourseStage } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { CourseStageNotFoundError } from "./errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** ADM-003 — title-only edit; ordering is managed separately by reorderCourseStages. */
export async function updateCourseStage(stageId: string, title: string): Promise<CourseStage> {
  if (!UUID_PATTERN.test(stageId)) throw new CourseStageNotFoundError();

  const [updated] = await db.update(courseStages).set({ title }).where(eq(courseStages.id, stageId)).returning();
  if (!updated) throw new CourseStageNotFoundError();
  return updated;
}
