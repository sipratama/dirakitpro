import "server-only";
import { courses, db, projects, users, type Project } from "@dirakitpro/database";
import { desc, eq } from "drizzle-orm";

export type ModerationQueueProject = Project & { learnerDisplayName: string; courseTitle: string };

/**
 * Cross-user project list for `/admin/projects` (ADM-007) — unlike
 * `getProjectsForUser`, this is not scoped to one owner. `moderationStatus`
 * omitted (`undefined`) defaults to the actual queue (`UNREVIEWED`); passing
 * `null` explicitly means "no filter" (the "lihat semua" toggle).
 */
export async function getProjectsForModeration(
  moderationStatus?: "UNREVIEWED" | "APPROVED" | "REJECTED" | "HIDDEN" | null,
): Promise<ModerationQueueProject[]> {
  const status = moderationStatus === undefined ? "UNREVIEWED" : moderationStatus;

  const rows = await db
    .select({ project: projects, learnerDisplayName: users.displayName, courseTitle: courses.title })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .innerJoin(courses, eq(projects.courseId, courses.id))
    .where(status === null ? undefined : eq(projects.moderationStatus, status))
    .orderBy(desc(projects.createdAt));

  return rows.map(({ project, learnerDisplayName, courseTitle }) => ({ ...project, learnerDisplayName, courseTitle }));
}
