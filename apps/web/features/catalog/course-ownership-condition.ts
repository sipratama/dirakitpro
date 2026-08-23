import "server-only";
import { courses, enrollments } from "@dirakitpro/database";
import { and, eq, inArray, sql, type SQL } from "drizzle-orm";

/**
 * Join condition for a `LEFT JOIN` from `courses` onto `enrollments`, matching an
 * ACTIVE/COMPLETED enrollment for the given user (CAT-006). Shared by every
 * catalog query that needs an `isOwned` flag, so there's one place that defines
 * what "owned" means. With no `userId` (guest), the condition never matches —
 * every joined row comes back null, so `isOwned` can never be wrongly true.
 */
export function courseOwnershipJoinCondition(userId: string | undefined): SQL {
  if (!userId) return sql`false`;

  return and(
    eq(enrollments.courseId, courses.id),
    eq(enrollments.userId, userId),
    inArray(enrollments.status, ["ACTIVE", "COMPLETED"]),
  )!;
}
