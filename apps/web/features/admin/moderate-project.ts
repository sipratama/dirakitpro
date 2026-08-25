import "server-only";
import { adminAuditLogs, db, projects, type Project } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { ModerationReasonRequiredError, ProjectNotFoundError } from "./errors";

export type ModerationAction = "APPROVE" | "REJECT" | "HIDE";

const ACTION_TO_STATUS: Record<ModerationAction, "APPROVED" | "REJECTED" | "HIDDEN"> = {
  APPROVE: "APPROVED",
  REJECT: "REJECTED",
  HIDE: "HIDDEN",
};

const ACTION_TO_AUDIT_ACTION: Record<ModerationAction, string> = {
  APPROVE: "PROJECT_APPROVED",
  REJECT: "PROJECT_REJECTED",
  HIDE: "PROJECT_HIDDEN",
};

/**
 * Admin moderation decision (ADM-007). Reject/Hide require a `reason`,
 * rejected at this function level (not only a form's UI) — ADM-007 is
 * explicit about storing a reason for those. An admin may move a project
 * from any prior moderation state to any of these three: this is a
 * moderation tool, not the learner-facing workflow state machine, so there's
 * no restricted transition table here (ADMIN_CORE.md §6).
 *
 * `moderationReason` is always overwritten (cleared to null on APPROVE) —
 * a stale REJECTED reason shouldn't linger once a project has moved on.
 *
 * Writes the AdminAuditLog row (ADM-008) in the SAME transaction as the
 * project update: if the audit write fails, the moderation change rolls back
 * too, never the other way around.
 */
export async function moderateProject(
  adminUserId: string,
  projectId: string,
  action: ModerationAction,
  reason?: string,
): Promise<Project> {
  if ((action === "REJECT" || action === "HIDE") && !reason?.trim()) {
    throw new ModerationReasonRequiredError();
  }

  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (!existing) throw new ProjectNotFoundError();

    const newStatus = ACTION_TO_STATUS[action];
    const [updated] = await tx
      .update(projects)
      .set({ moderationStatus: newStatus, moderationReason: reason?.trim() ?? null })
      .where(eq(projects.id, projectId))
      .returning();

    await tx.insert(adminAuditLogs).values({
      adminUserId,
      action: ACTION_TO_AUDIT_ACTION[action],
      targetType: "project",
      targetId: projectId,
      reason: reason?.trim() ?? null,
      beforeData: { moderationStatus: existing.moderationStatus },
      afterData: { moderationStatus: newStatus },
    });

    return updated;
  });
}
