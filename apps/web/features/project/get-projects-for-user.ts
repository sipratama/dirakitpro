import "server-only";
import { courses, db, projects, type Project } from "@dirakitpro/database";
import { desc, eq } from "drizzle-orm";

export type ProjectSummary = Project & { courseTitle: string };

/** A learner's own projects for `/projects/me` (PRJ-001) — most recently created first. */
export async function getProjectsForUser(userId: string): Promise<ProjectSummary[]> {
  const rows = await db
    .select({ project: projects, courseTitle: courses.title })
    .from(projects)
    .innerJoin(courses, eq(projects.courseId, courses.id))
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));

  return rows.map(({ project, courseTitle }) => ({ ...project, courseTitle }));
}
