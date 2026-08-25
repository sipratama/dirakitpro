import "server-only";
import { buildMilestones, db } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { ReorderSetMismatchError } from "./errors";

/**
 * ADM-003/CURRICULUM_MANAGEMENT.md §4 — same full-order-in-one-transaction
 * shape as reorderCourseStages/reorderLessons. Unlike `course_stages`,
 * `build_milestones` has no unique (course_id, position) index, so this
 * doesn't need the two-phase negative-position workaround. Never touches
 * `lessons.buildMilestoneId` — reordering only changes `position`, so
 * existing lesson->milestone relations are untouched by construction.
 */
export async function reorderBuildMilestones(courseId: string, orderedMilestoneIds: string[]): Promise<void> {
  const existing = await db.select({ id: buildMilestones.id }).from(buildMilestones).where(eq(buildMilestones.courseId, courseId));
  const existingIds = new Set(existing.map((row) => row.id));

  if (existingIds.size !== orderedMilestoneIds.length || orderedMilestoneIds.some((id) => !existingIds.has(id))) {
    throw new ReorderSetMismatchError();
  }

  await db.transaction(async (tx) => {
    for (const [index, milestoneId] of orderedMilestoneIds.entries()) {
      await tx.update(buildMilestones).set({ position: index + 1 }).where(eq(buildMilestones.id, milestoneId));
    }
  });
}
