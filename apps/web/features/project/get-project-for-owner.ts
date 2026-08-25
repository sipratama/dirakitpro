import "server-only";
import { db, projects, type Project } from "@dirakitpro/database";
import { eq } from "drizzle-orm";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Ownership-checked project lookup for `/projects/me/[projectId]` — not the
 * owner, or doesn't exist, both return null (PRJ-003), same
 * non-distinguishing pattern as `getOrderForOwner`.
 */
export async function getProjectForOwner(projectId: string, userId: string): Promise<Project | null> {
  if (!UUID_PATTERN.test(projectId)) return null;

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project || project.userId !== userId) return null;

  return project;
}
