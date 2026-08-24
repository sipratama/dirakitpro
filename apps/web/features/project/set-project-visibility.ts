import "server-only";
import { db, projects, type Project } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { ProjectNotSubmittedError, ProjectOwnershipError } from "./errors";

/**
 * PRIVATE <-> PUBLIC toggle (PRJ-003/PRJ-004). Going PUBLIC is only allowed
 * once the workflow is SUBMITTED (PROJECT_SHOWCASE.md §2.2 — publishing an
 * incomplete DRAFT publicly doesn't match the intent of a showcase).
 *
 * Going PUBLIC resets moderationStatus to UNREVIEWED, EXCEPT when it's
 * already APPROVED — a learner re-toggling PRIVATE -> PUBLIC after an admin
 * already approved it shouldn't lose that approval and get silently
 * re-queued for review; this function never touches showcase content, so
 * "toggle only, no content change" always holds here. Any other prior
 * moderation state (UNREVIEWED/REJECTED/HIDDEN) resets to UNREVIEWED so an
 * admin sees it again.
 */
export async function setProjectVisibility(
  projectId: string,
  userId: string,
  visibility: "PRIVATE" | "PUBLIC",
): Promise<Project> {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project || project.userId !== userId) throw new ProjectOwnershipError();

  if (visibility === "PUBLIC" && project.status !== "SUBMITTED") {
    throw new ProjectNotSubmittedError();
  }

  const [updated] = await db
    .update(projects)
    .set({
      visibility,
      moderationStatus:
        visibility === "PUBLIC" && project.moderationStatus !== "APPROVED" ? "UNREVIEWED" : project.moderationStatus,
      publishedAt: visibility === "PUBLIC" ? project.publishedAt ?? new Date() : project.publishedAt,
    })
    .where(eq(projects.id, projectId))
    .returning();

  return updated;
}
