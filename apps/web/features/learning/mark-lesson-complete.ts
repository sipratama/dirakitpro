import "server-only";
import { db, lessonProgress, type Database, type LessonProgress, type Transaction } from "@dirakitpro/database";
import { sql } from "drizzle-orm";

/**
 * Idempotent lesson completion (LRN-005, 10.5). There's no separate
 * auto-detected STARTED step (LEARNING_WORKSPACE.md §3.2 default: a single
 * uniform "Tandai selesai" action), so this upserts straight to COMPLETED.
 * `completedAt` is coalesced against any existing value rather than
 * overwritten, so a repeat call (including two concurrent calls racing on
 * the same lesson) reports the FIRST completion time, not the latest click.
 */
export async function markLessonComplete(
  userId: string,
  lessonId: string,
  executor: Database | Transaction = db,
): Promise<LessonProgress> {
  const now = new Date();
  const [progress] = await executor
    .insert(lessonProgress)
    .values({ userId, lessonId, status: "COMPLETED", startedAt: now, completedAt: now })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        status: "COMPLETED",
        completedAt: sql`coalesce(${lessonProgress.completedAt}, ${now})`,
      },
    })
    .returning();
  return progress;
}
