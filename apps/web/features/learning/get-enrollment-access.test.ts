import { courses, db, enrollments, type NewCourse, users } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getEnrollmentAccess } from "./get-enrollment-access";

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

describe("getEnrollmentAccess", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (userIds.length) await db.delete(enrollments).where(inArray(enrollments.userId, userIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds)); // cascades stages/lessons/milestones
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("returns null when the course slug doesn't exist", async () => {
    const learner = await insertLearner();
    userIds.push(learner.id);

    expect(await getEnrollmentAccess(learner.id, "does-not-exist")).toBeNull();
  });

  it("returns null when the course exists but the learner has no enrollment", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    expect(await getEnrollmentAccess(learner.id, course.slug)).toBeNull();
  });

  it("returns the course and enrollment for an ACTIVE enrollment", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(enrollments).values({ userId: learner.id, courseId: course.id, status: "ACTIVE" });

    const access = await getEnrollmentAccess(learner.id, course.slug);
    expect(access?.course.id).toBe(course.id);
    expect(access?.enrollment.status).toBe("ACTIVE");
  });

  it("returns access for a COMPLETED enrollment too", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(enrollments).values({ userId: learner.id, courseId: course.id, status: "COMPLETED" });

    expect(await getEnrollmentAccess(learner.id, course.slug)).not.toBeNull();
  });

  it("does not grant access from a REVOKED enrollment", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(enrollments).values({ userId: learner.id, courseId: course.id, status: "REVOKED" });

    expect(await getEnrollmentAccess(learner.id, course.slug)).toBeNull();
  });

  it("keeps access after the course is UNPUBLISHED (LRN-006) — must not filter by publishing state", async () => {
    const course = await insertCourse({ status: "PUBLISHED" });
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(enrollments).values({ userId: learner.id, courseId: course.id, status: "ACTIVE" });

    await db.update(courses).set({ status: "UNPUBLISHED" }).where(eq(courses.id, course.id));

    const access = await getEnrollmentAccess(learner.id, course.slug);
    expect(access?.course.status).toBe("UNPUBLISHED");
  });
});
