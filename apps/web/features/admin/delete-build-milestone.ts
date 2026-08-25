import "server-only";
import { buildMilestones, db, lessons } from "@dirakitpro/database";
import { count, eq } from "drizzle-orm";
import { BuildMilestoneInUseError, BuildMilestoneNotFoundError } from "./errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * ADM-003/CURRICULUM_MANAGEMENT.md §4 — rejects if any lesson still
 * references this milestone via `buildMilestoneId`, rather than silently
 * cascading to `null` (the DB FK is itself `ON DELETE SET NULL`, but doing
 * that on purpose here would quietly break BLD-002's CHECKPOINT-driven
 * completion derivation for a lesson that still thinks it drives this
 * milestone).
 */
export async function deleteBuildMilestone(milestoneId: string): Promise<void> {
  if (!UUID_PATTERN.test(milestoneId)) throw new BuildMilestoneNotFoundError();

  const [existing] = await db.select({ id: buildMilestones.id }).from(buildMilestones).where(eq(buildMilestones.id, milestoneId)).limit(1);
  if (!existing) throw new BuildMilestoneNotFoundError();

  const [{ value: lessonCount }] = await db.select({ value: count() }).from(lessons).where(eq(lessons.buildMilestoneId, milestoneId));
  if (lessonCount > 0) {
    throw new BuildMilestoneInUseError(`This milestone is still referenced by ${lessonCount} lesson(s).`);
  }

  await db.delete(buildMilestones).where(eq(buildMilestones.id, milestoneId));
}
