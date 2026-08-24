import "server-only";
import { db, projects, users, type Project } from "@dirakitpro/database";
import { and, eq } from "drizzle-orm";

export type PublicProject = Project & {
  authorUsername: string;
  authorDisplayName: string;
  indexable: boolean;
};

/**
 * Public showcase lookup for `/projects/[username]/[slug]` (PRJ-007). Returns
 * null for PRIVATE (for every viewer, including the owner — they use
 * `/projects/me/[projectId]` instead) and for HIDDEN/REJECTED (must not
 * appear on any discovery surface, including a live direct link).
 *
 * `indexable` is true only once APPROVED — PUBLIC + UNREVIEWED still renders
 * (PRJ-004: the direct link goes live immediately) but the page must set
 * `robots: noindex` until an admin reviews it.
 */
export async function getPublicProject(username: string, slug: string): Promise<PublicProject | null> {
  const [owner] = await db
    .select({ id: users.id, username: users.username, displayName: users.displayName })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (!owner) return null;

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, owner.id), eq(projects.slug, slug)))
    .limit(1);
  if (!project) return null;

  if (project.visibility !== "PUBLIC") return null;
  if (project.moderationStatus === "HIDDEN" || project.moderationStatus === "REJECTED") return null;

  return {
    ...project,
    authorUsername: owner.username,
    authorDisplayName: owner.displayName,
    indexable: project.moderationStatus === "APPROVED",
  };
}
