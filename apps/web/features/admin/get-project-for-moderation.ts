import "server-only";
import { courses, db, projects, users, type Project } from "@dirakitpro/database";
import { eq } from "drizzle-orm";

export type ProjectForModeration = Project & { learnerDisplayName: string; learnerUsername: string; courseTitle: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Full project detail for `/admin/projects/[projectId]` — unlike
 * `getProjectForOwner`, there is deliberately no ownership check: an admin
 * may view any learner's project. `projectId` is still validated as a
 * well-formed UUID first (same guard as `getOrderForOwner`), so a malformed
 * id 404s cleanly instead of hitting Postgres with an invalid `uuid` literal.
 */
export async function getProjectForModeration(projectId: string): Promise<ProjectForModeration | null> {
  if (!UUID_PATTERN.test(projectId)) return null;

  const [row] = await db
    .select({
      project: projects,
      learnerDisplayName: users.displayName,
      learnerUsername: users.username,
      courseTitle: courses.title,
    })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .innerJoin(courses, eq(projects.courseId, courses.id))
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!row) return null;

  return { ...row.project, learnerDisplayName: row.learnerDisplayName, learnerUsername: row.learnerUsername, courseTitle: row.courseTitle };
}
