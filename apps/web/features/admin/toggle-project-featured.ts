import "server-only";
import { adminAuditLogs, db, projects, type Project } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { ProjectNotApprovedError, ProjectNotFoundError } from "./errors";

/**
 * Featured toggle (ADM-007). Can only be set `true` while the project is
 * currently APPROVED — same shape of guard as `setProjectVisibility`'s
 * SUBMITTED requirement, not a new kind of rule. Un-featuring has no such
 * restriction (pulling a project out of the curated gallery is always safe).
 *
 * Writes the AdminAuditLog row (ADM-008) in the same transaction as the
 * project update.
 */
export async function toggleProjectFeatured(adminUserId: string, projectId: string, isFeatured: boolean): Promise<Project> {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (!existing) throw new ProjectNotFoundError();

    if (isFeatured && existing.moderationStatus !== "APPROVED") {
      throw new ProjectNotApprovedError();
    }

    const [updated] = await tx.update(projects).set({ isFeatured }).where(eq(projects.id, projectId)).returning();

    await tx.insert(adminAuditLogs).values({
      adminUserId,
      action: isFeatured ? "PROJECT_FEATURED" : "PROJECT_UNFEATURED",
      targetType: "project",
      targetId: projectId,
      reason: null,
      beforeData: { isFeatured: existing.isFeatured },
      afterData: { isFeatured },
    });

    return updated;
  });
}
