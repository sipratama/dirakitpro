import { courses, db, enrollments, projects, type NewCourse, users } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { grantEnrollment } from "../commerce/grant-enrollment";
import { getEnrollmentAccess } from "../learning/get-enrollment-access";
import { CourseNotFoundError } from "./errors";
import { unpublishCourse } from "./unpublish-course";

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
      price: "0",
      status: "PUBLISHED",
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

describe("unpublishCourse", () => {
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

  it("transitions a PUBLISHED course to UNPUBLISHED", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);

    const result = await unpublishCourse(course.id);
    expect(result.status).toBe("UNPUBLISHED");
  });

  it("throws for a nonexistent course id", async () => {
    await expect(unpublishCourse("00000000-0000-0000-0000-000000000000")).rejects.toThrow(CourseNotFoundError);
  });

  // CAT-003/LRN-006 regression: unpublishing must not revoke access for a
  // learner who already holds an ACTIVE enrollment. Reuses getEnrollmentAccess
  // (Wave 5) as the guard under test rather than re-implementing it.
  it("does not revoke an existing learner's access after unpublishing", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await grantEnrollment(learner.id, course.id);

    await unpublishCourse(course.id);

    const access = await getEnrollmentAccess(learner.id, course.slug);
    expect(access).not.toBeNull();
    expect(access?.enrollment.status).toBe("ACTIVE");
  });
});
