import "server-only";
import { buildMilestones, db, type BuildMilestone } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { BuildMilestoneNotFoundError } from "./errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** ADM-003/CURRICULUM_MANAGEMENT.md §4 — title/isRequired edit only; ordering is managed separately by reorderBuildMilestones. Doesn't touch completion state (BLD-002 derivation is unchanged). */
export async function updateBuildMilestone(milestoneId: string, title: string, isRequired: boolean): Promise<BuildMilestone> {
  if (!UUID_PATTERN.test(milestoneId)) throw new BuildMilestoneNotFoundError();

  const [updated] = await db
    .update(buildMilestones)
    .set({ title, isRequired })
    .where(eq(buildMilestones.id, milestoneId))
    .returning();
  if (!updated) throw new BuildMilestoneNotFoundError();
  return updated;
}
