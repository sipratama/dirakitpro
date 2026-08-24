import "server-only";
import {
  buildProgress,
  db,
  lessonProgress,
  lessons,
  type BuildProgress,
  type Database,
  type Transaction,
} from "@dirakitpro/database";
import { and, eq, inArray, sql } from "drizzle-orm";

/**
 * BLD-002: a BuildMilestone is never marked complete by a direct learner
 * action — it's fully derived. Call this after `markLessonComplete` on a
 * CHECKPOINT lesson: it checks whether every REQUIRED CHECKPOINT lesson
 * associated to `buildMilestoneId` (via `lessons.buildMilestoneId`) now has a
 * COMPLETED LessonProgress row, and if so upserts BuildProgress to COMPLETED.
 * OPTIONAL CHECKPOINT lessons are excluded from the gating set entirely.
 * Returns null (no-op) when the milestone isn't fully satisfied yet.
 */
export async function deriveBuildMilestoneCompletion(
  userId: string,
  buildMilestoneId: string,
  executor: Database | Transaction = db,
): Promise<BuildProgress | null> {
  const requiredCheckpointLessons = await executor
    .select({ id: lessons.id })
    .from(lessons)
    .where(
      and(
        eq(lessons.buildMilestoneId, buildMilestoneId),
        eq(lessons.type, "CHECKPOINT"),
        eq(lessons.isRequired, true),
      ),
    );

  if (requiredCheckpointLessons.length === 0) return null;
  const lessonIds = requiredCheckpointLessons.map((row) => row.id);

  const completedRows = await executor
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        inArray(lessonProgress.lessonId, lessonIds),
        eq(lessonProgress.status, "COMPLETED"),
      ),
    );

  if (completedRows.length < lessonIds.length) return null;

  const now = new Date();
  const [progress] = await executor
    .insert(buildProgress)
    .values({ userId, buildMilestoneId, status: "COMPLETED", completedAt: now })
    .onConflictDoUpdate({
      target: [buildProgress.userId, buildProgress.buildMilestoneId],
      set: {
        status: "COMPLETED",
        completedAt: sql`coalesce(${buildProgress.completedAt}, ${now})`,
      },
    })
    .returning();
  return progress;
}
