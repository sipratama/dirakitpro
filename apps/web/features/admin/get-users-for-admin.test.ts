import { courses, db, enrollments, type NewCourse, users } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getUsersForAdmin } from "./get-users-for-admin";

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

async function insertLearner(overrides: Partial<{ email: string; username: string }> = {}) {
  const [user] = await db
    .insert(users)
    .values({
      email: overrides.email ?? `${uniqueSlug("learner")}@example.com`,
      username: overrides.username ?? uniqueSlug("learner"),
      displayName: "Test Learner",
      role: "LEARNER",
    })
    .returning();
  return user;
}

describe("getUsersForAdmin", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (userIds.length) await db.delete(enrollments).where(inArray(enrollments.userId, userIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  // Finds the specific row this test created rather than asserting the full
  // list/length — the users table is global and other test files run
  // concurrently against the same dev DB.
  it("includes a user's email, username, role, and enrollment count", async () => {
    const email = `${uniqueSlug("admin-view")}@example.com`;
    const learner = await insertLearner({ email });
    userIds.push(learner.id);
    const courseA = await insertCourse();
    const courseB = await insertCourse();
    courseIds.push(courseA.id, courseB.id);
    await db.insert(enrollments).values([
      { userId: learner.id, courseId: courseA.id, status: "ACTIVE" },
      { userId: learner.id, courseId: courseB.id, status: "ACTIVE" },
    ]);

    const result = await getUsersForAdmin();
    const row = result.find((user) => user.id === learner.id);

    expect(row?.email).toBe(email);
    expect(row?.username).toBe(learner.username);
    expect(row?.role).toBe("LEARNER");
    expect(row?.enrollmentCount).toBe(2);
  });

  it("reports 0 enrollments for a user with none", async () => {
    const learner = await insertLearner();
    userIds.push(learner.id);

    const result = await getUsersForAdmin();
    const row = result.find((user) => user.id === learner.id);

    expect(row?.enrollmentCount).toBe(0);
  });
});
