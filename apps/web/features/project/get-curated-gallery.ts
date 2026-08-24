import "server-only";
import { db, projects, users, type Project } from "@dirakitpro/database";
import { and, desc, eq } from "drizzle-orm";

export type GalleryProject = Project & { authorUsername: string; authorDisplayName: string };

/**
 * Curated public gallery for `/projects` (PRJ-006) — PUBLIC + APPROVED +
 * FEATURED only. Expected to render empty through all of Wave 6: nothing sets
 * APPROVED/FEATURED until Wave 7 (admin moderation) exists. That's not a bug
 * to work around here — no fallback that shows other projects instead.
 */
export async function getCuratedGallery(): Promise<GalleryProject[]> {
  const rows = await db
    .select({ project: projects, authorUsername: users.username, authorDisplayName: users.displayName })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(and(eq(projects.visibility, "PUBLIC"), eq(projects.moderationStatus, "APPROVED"), eq(projects.isFeatured, true)))
    .orderBy(desc(projects.publishedAt));

  return rows.map(({ project, authorUsername, authorDisplayName }) => ({ ...project, authorUsername, authorDisplayName }));
}
