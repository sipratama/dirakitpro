import "server-only";
import { buildMilestones, db, type BuildMilestone } from "@dirakitpro/database";
import { count, eq } from "drizzle-orm";

/** ADM-003/CURRICULUM_MANAGEMENT.md §4 — appends a new milestone at the end of the course's current milestone order. */
export async function createBuildMilestone(courseId: string, title: string, isRequired: boolean): Promise<BuildMilestone> {
  const [{ value: milestoneCount }] = await db
    .select({ value: count() })
    .from(buildMilestones)
    .where(eq(buildMilestones.courseId, courseId));

  const [created] = await db
    .insert(buildMilestones)
    .values({ courseId, title, isRequired, position: milestoneCount + 1 })
    .returning();
  return created;
}
