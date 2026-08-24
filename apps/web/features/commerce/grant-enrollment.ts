import "server-only";
import { db, enrollments, type Database, type Enrollment, type Transaction } from "@dirakitpro/database";
import { and, eq, inArray } from "drizzle-orm";
import { isUniqueViolation } from "./is-unique-violation";

export type GrantEnrollmentResult =
  | { kind: "created"; enrollment: Enrollment }
  | { kind: "already_enrolled"; enrollment: Enrollment };

async function findActiveEnrollment(
  executor: Database | Transaction,
  userId: string,
  courseId: string,
): Promise<Enrollment | null> {
  const [existing] = await executor
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId),
        inArray(enrollments.status, ["ACTIVE", "COMPLETED"]),
      ),
    )
    .limit(1);
  return existing ?? null;
}

/**
 * Idempotent Enrollment activation (COM-011, 10.4) — the single place that
 * decides "does this user already have access to this course". Shared by the
 * free-course path (create-course-order.ts) and the webhook PAID path
 * (process-payment-notification.ts), so both report "already enrolled" the
 * same way instead of each re-deriving it independently. Checks first for a
 * clear return value, but also falls back to catching the partial unique
 * index violation for the concurrent-call case, since the pre-check and the
 * insert are not atomic together.
 *
 * Accepts an optional `executor` (defaults to the module-level `db`) so a
 * caller already inside a `db.transaction(async (tx) => ...)` — e.g. the
 * webhook handler, where the grant MUST commit/rollback atomically with the
 * Order/Payment update — can pass `tx` and have this participate in that same
 * transaction instead of opening an independent connection.
 */
export async function grantEnrollment(
  userId: string,
  courseId: string,
  executor: Database | Transaction = db,
): Promise<GrantEnrollmentResult> {
  const existing = await findActiveEnrollment(executor, userId, courseId);
  if (existing) return { kind: "already_enrolled", enrollment: existing };

  try {
    const [enrollment] = await executor.insert(enrollments).values({ userId, courseId, status: "ACTIVE" }).returning();
    return { kind: "created", enrollment };
  } catch (error) {
    if (isUniqueViolation(error, "enrollments_active_user_course_idx")) {
      const raced = await findActiveEnrollment(executor, userId, courseId);
      if (raced) return { kind: "already_enrolled", enrollment: raced };
    }
    throw error;
  }
}
