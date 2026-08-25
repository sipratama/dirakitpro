import "server-only";
import { courses, db, type Course } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { CourseNotFoundError } from "./errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * CAT-003/ADM-002 unpublish transition. Only stops discovery and new direct
 * purchase — access for learners with an existing ACTIVE/COMPLETED
 * Enrollment is untouched, since course access is governed by Enrollment
 * (LRN-006), not by this status column.
 */
export async function unpublishCourse(courseId: string): Promise<Course> {
  if (!UUID_PATTERN.test(courseId)) throw new CourseNotFoundError();

  const [existing] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!existing) throw new CourseNotFoundError();

  const [updated] = await db.update(courses).set({ status: "UNPUBLISHED" }).where(eq(courses.id, courseId)).returning();
  return updated;
}
