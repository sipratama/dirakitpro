import "server-only";
import { db, enrollments, type Enrollment } from "@dirakitpro/database";
import { and, eq, inArray } from "drizzle-orm";
import { isUniqueViolation } from "./is-unique-violation";

export type GrantEnrollmentResult =
  | { kind: "created"; enrollment: Enrollment }
  | { kind: "already_enrolled"; enrollment: Enrollment };

async function findActiveEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
  const [existing] = await db
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
 * free-course path (create-course-order.ts) and the webhook PAID path (Fase 3),
 * so both report "already enrolled" the same way instead of each re-deriving it
 * independently. Checks first for a clear return value, but also falls back to
 * catching the partial unique index violation for the concurrent-call case,
 * since the pre-check and the insert are not atomic together.
 */
export async function grantEnrollment(userId: string, courseId: string): Promise<GrantEnrollmentResult> {
  const existing = await findActiveEnrollment(userId, courseId);
  if (existing) return { kind: "already_enrolled", enrollment: existing };

  try {
    const [enrollment] = await db.insert(enrollments).values({ userId, courseId, status: "ACTIVE" }).returning();
    return { kind: "created", enrollment };
  } catch (error) {
    if (isUniqueViolation(error, "enrollments_active_user_course_idx")) {
      const raced = await findActiveEnrollment(userId, courseId);
      if (raced) return { kind: "already_enrolled", enrollment: raced };
    }
    throw error;
  }
}
