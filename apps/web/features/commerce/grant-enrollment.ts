import "server-only";
import {
  courses,
  db,
  enrollments,
  projects,
  type Database,
  type Enrollment,
  type Transaction,
} from "@dirakitpro/database";
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

async function findProjectForEnrollment(executor: Database | Transaction, enrollmentId: string) {
  const [existing] = await executor.select().from(projects).where(eq(projects.enrollmentId, enrollmentId)).limit(1);
  return existing ?? null;
}

/**
 * Idempotent Project auto-creation (PRJ-001) — every ACTIVE Enrollment must
 * have exactly one DRAFT/PRIVATE/UNREVIEWED Project before the learner acts on
 * it. Uses the enrollment's course slug as the project slug: a user can only
 * ever hold one active Enrollment per course (10.8), so it's unique per user
 * without inventing slugify-from-title logic. Same select-then-insert +
 * catch-unique-violation shape as findActiveEnrollment, for the same reason
 * (pre-check and insert aren't atomic together under concurrent calls).
 */
async function ensureProjectForEnrollment(
  executor: Database | Transaction,
  userId: string,
  courseId: string,
  enrollmentId: string,
): Promise<void> {
  const existing = await findProjectForEnrollment(executor, enrollmentId);
  if (existing) return;

  const [course] = await executor.select({ slug: courses.slug }).from(courses).where(eq(courses.id, courseId)).limit(1);

  try {
    await executor.insert(projects).values({ userId, courseId, enrollmentId, slug: course.slug });
  } catch (error) {
    if (isUniqueViolation(error, "projects_enrollment_id_idx")) return;
    throw error;
  }
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
 *
 * Also ensures the Enrollment's Project exists (PRJ-001) in the same
 * executor/transaction, on both the newly-created and already-enrolled paths
 * — so a retried call (e.g. a webhook retry after the enrollment already
 * exists) still guarantees the Project without a separate backfill step.
 */
export async function grantEnrollment(
  userId: string,
  courseId: string,
  executor: Database | Transaction = db,
): Promise<GrantEnrollmentResult> {
  const existing = await findActiveEnrollment(executor, userId, courseId);
  if (existing) {
    await ensureProjectForEnrollment(executor, userId, courseId, existing.id);
    return { kind: "already_enrolled", enrollment: existing };
  }

  try {
    const [enrollment] = await executor.insert(enrollments).values({ userId, courseId, status: "ACTIVE" }).returning();
    await ensureProjectForEnrollment(executor, userId, courseId, enrollment.id);
    return { kind: "created", enrollment };
  } catch (error) {
    if (isUniqueViolation(error, "enrollments_active_user_course_idx")) {
      const raced = await findActiveEnrollment(executor, userId, courseId);
      if (raced) {
        await ensureProjectForEnrollment(executor, userId, courseId, raced.id);
        return { kind: "already_enrolled", enrollment: raced };
      }
    }
    throw error;
  }
}
