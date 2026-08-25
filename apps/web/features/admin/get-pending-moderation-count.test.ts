import { courses, db, enrollments, projects, type NewCourse, users } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { grantEnrollment } from "../commerce/grant-enrollment";
import { afterEach, describe, expect, it } from "vitest";
import { getPendingModerationCount } from "./get-pending-moderation-count";

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

describe("getPendingModerationCount", () => {
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

  // Asserts the DELTA rather than an absolute count: this table is global
  // (not scoped to this test's own rows), and other test files run
  // concurrently against the same dev DB, so an absolute count would be flaky.
  it("counts only projects with moderationStatus UNREVIEWED", async () => {
    const before = await getPendingModerationCount();

    const courseA = await insertCourse();
    const courseB = await insertCourse();
    courseIds.push(courseA.id, courseB.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    await grantEnrollment(learner.id, courseA.id);
    await grantEnrollment(learner.id, courseB.id);
    const [projectA] = await db.select().from(projects).where(eq(projects.courseId, courseA.id));
    await db.update(projects).set({ moderationStatus: "APPROVED" }).where(eq(projects.id, projectA.id));

    const after = await getPendingModerationCount();
    expect(after - before).toBe(1);
  });
});
