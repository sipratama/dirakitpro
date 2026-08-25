import { courses, db, enrollments, projects, type NewCourse, users } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { grantEnrollment } from "./grant-enrollment";

function uniqueSlug(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

async function insertCourse(overrides: Partial<NewCourse> = {}) {
  const [course] = await db
    .insert(courses)
    .values({
      slug: uniqueSlug("test-course"),
      title: "Test Course",
      outcomeDescription: "Outcome",
      description: "Description",
      status: "PUBLISHED",
      price: "0",
      ...overrides,
    })
    .returning();
  return course;
}

async function insertLearner() {
  const [user] = await db
    .insert(users)
    .values({
      email: `${uniqueSlug("learner")}@example.com`,
      username: uniqueSlug("learner"),
      displayName: "Test Learner",
      role: "LEARNER",
    })
    .returning();
  return user;
}

describe("grantEnrollment", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (userIds.length) await db.delete(projects).where(inArray(projects.userId, userIds));
    if (userIds.length) await db.delete(enrollments).where(inArray(enrollments.userId, userIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("creates exactly one Enrollment and reports 'already_enrolled' on a repeat call (COM-011)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const first = await grantEnrollment(learner.id, course.id);
    const second = await grantEnrollment(learner.id, course.id);

    expect(first.kind).toBe("created");
    expect(second.kind).toBe("already_enrolled");
    expect(second.enrollment.id).toBe(first.enrollment.id);

    const rows = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, learner.id));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("ACTIVE");
  });

  it("stays idempotent when two calls race for the same brand-new user+course (webhook retry shape)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const [a, b] = await Promise.all([grantEnrollment(learner.id, course.id), grantEnrollment(learner.id, course.id)]);

    expect(a.enrollment.id).toBe(b.enrollment.id);

    const rows = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, learner.id));
    expect(rows).toHaveLength(1);

    const projectRows = await db.select().from(projects).where(eq(projects.enrollmentId, a.enrollment.id));
    expect(projectRows).toHaveLength(1);
  });

  it("auto-creates exactly one DRAFT Project for the Enrollment (PRJ-001)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const result = await grantEnrollment(learner.id, course.id);

    const rows = await db.select().from(projects).where(eq(projects.enrollmentId, result.enrollment.id));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("DRAFT");
    expect(rows[0]?.visibility).toBe("PRIVATE");
    expect(rows[0]?.moderationStatus).toBe("UNREVIEWED");
    expect(rows[0]?.userId).toBe(learner.id);
    expect(rows[0]?.courseId).toBe(course.id);
    expect(rows[0]?.slug).toBe(course.slug);
  });

  it("stays idempotent for the Project when grantEnrollment is called twice for the same Enrollment (PRJ-001)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const first = await grantEnrollment(learner.id, course.id);
    const second = await grantEnrollment(learner.id, course.id);

    expect(second.kind).toBe("already_enrolled");

    const rows = await db.select().from(projects).where(eq(projects.enrollmentId, first.enrollment.id));
    expect(rows).toHaveLength(1);
  });
});
