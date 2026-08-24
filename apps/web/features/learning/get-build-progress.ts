import "server-only";
import { buildMilestones, buildProgress, db } from "@dirakitpro/database";
import { and, eq, inArray } from "drizzle-orm";

export type BuildProgressSummary = {
  completedCount: number;
  totalRequired: number;
  ratio: number; // 0..1; 0 when the course has no REQUIRED milestone configured yet
};

/**
 * BLD-003: Build Progress = proportion of REQUIRED BuildMilestones complete
 * out of total REQUIRED BuildMilestones for the course — derived from
 * milestone completion (BLD-002), never directly from lesson/video completion.
 */
export async function getBuildProgress(userId: string, courseId: string): Promise<BuildProgressSummary> {
  const requiredMilestones = await db
    .select({ id: buildMilestones.id })
    .from(buildMilestones)
    .where(and(eq(buildMilestones.courseId, courseId), eq(buildMilestones.isRequired, true)));

  const totalRequired = requiredMilestones.length;
  if (totalRequired === 0) return { completedCount: 0, totalRequired: 0, ratio: 0 };

  const milestoneIds = requiredMilestones.map((row) => row.id);
  const completedRows = await db
    .select({ buildMilestoneId: buildProgress.buildMilestoneId })
    .from(buildProgress)
    .where(
      and(
        eq(buildProgress.userId, userId),
        inArray(buildProgress.buildMilestoneId, milestoneIds),
        eq(buildProgress.status, "COMPLETED"),
      ),
    );

  const completedCount = completedRows.length;
  return { completedCount, totalRequired, ratio: completedCount / totalRequired };
}
