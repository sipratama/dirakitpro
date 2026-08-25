import "server-only";
import { courses, db, type Course } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { CourseNotFoundError, CoursePriceInvalidError } from "./errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * CAT-003/ADM-002 publish transition. COM-001's own acceptance criterion is
 * checked explicitly here (not only relied on as a DB constraint): a course
 * with a non-zero price must have a valid, positive numeric price to
 * publish. A FREE course (price = 0) is exempt from this check entirely.
 *
 * This is an admin tool, not a restricted learner workflow — publish is
 * allowed from any current status (DRAFT or UNPUBLISHED), matching the same
 * "admin may move to any state" shape as moderateProject.
 */
export async function publishCourse(courseId: string): Promise<Course> {
  if (!UUID_PATTERN.test(courseId)) throw new CourseNotFoundError();

  const [existing] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!existing) throw new CourseNotFoundError();

  const price = Number(existing.price);
  if (price !== 0 && !(Number.isFinite(price) && price > 0)) {
    throw new CoursePriceInvalidError();
  }

  const [updated] = await db
    .update(courses)
    .set({ status: "PUBLISHED", publishedAt: existing.publishedAt ?? new Date() })
    .where(eq(courses.id, courseId))
    .returning();
  return updated;
}
