import "server-only";
import { courseStages, db } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { ReorderSetMismatchError } from "./errors";

/**
 * ADM-003 — persists a full new order in one transaction (all `position`
 * values updated together), not a series of one-at-a-time swaps, so a
 * concurrent read never observes a half-reordered stage list. `orderedStageIds`
 * must be exactly the course's current stage id set — up/down buttons on the
 * page always submit the full list, so a mismatch means stale client state.
 */
export async function reorderCourseStages(courseId: string, orderedStageIds: string[]): Promise<void> {
  const existing = await db.select({ id: courseStages.id }).from(courseStages).where(eq(courseStages.courseId, courseId));
  const existingIds = new Set(existing.map((row) => row.id));

  if (existingIds.size !== orderedStageIds.length || orderedStageIds.some((id) => !existingIds.has(id))) {
    throw new ReorderSetMismatchError();
  }

  // `course_stages` has a unique (course_id, position) index, so writing
  // final positions one row at a time can collide mid-transaction with
  // another row's still-unmoved position (e.g. swapping 1<->2 tries to set
  // row A to 1 while row B, not yet updated, still holds 1). Two-phase
  // update sidesteps this: first move every row to a negative, guaranteed-
  // unused position, then set final positions once no collision is possible.
  await db.transaction(async (tx) => {
    for (const [index, stageId] of orderedStageIds.entries()) {
      await tx.update(courseStages).set({ position: -(index + 1) }).where(eq(courseStages.id, stageId));
    }
    for (const [index, stageId] of orderedStageIds.entries()) {
      await tx.update(courseStages).set({ position: index + 1 }).where(eq(courseStages.id, stageId));
    }
  });
}
