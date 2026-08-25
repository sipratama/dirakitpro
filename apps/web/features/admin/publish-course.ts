import "server-only";
import { adminAuditLogs, courses, db, type Course } from "@dirakitpro/database";
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
 *
 * Writes the AdminAuditLog row (ADM-008) in the same transaction as the
 * course update — same shape as moderateProject/toggleProjectFeatured.
 * `afterData` also records `price`, since COM-001's price-at-publish-time is
 * exactly the sensitive fact this audit exists to capture.
 */
export async function publishCourse(courseId: string, adminUserId: string): Promise<Course> {
  if (!UUID_PATTERN.test(courseId)) throw new CourseNotFoundError();

  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(courses).where(eq(courses.id, courseId)).limit(1);
    if (!existing) throw new CourseNotFoundError();

    const price = Number(existing.price);
    if (price !== 0 && !(Number.isFinite(price) && price > 0)) {
      throw new CoursePriceInvalidError();
    }

    const [updated] = await tx
      .update(courses)
      .set({ status: "PUBLISHED", publishedAt: existing.publishedAt ?? new Date() })
      .where(eq(courses.id, courseId))
      .returning();

    await tx.insert(adminAuditLogs).values({
      adminUserId,
      action: "COURSE_PUBLISHED",
      targetType: "course",
      targetId: courseId,
      beforeData: { status: existing.status },
      afterData: { status: "PUBLISHED", price: existing.price },
    });

    return updated;
  });
}
