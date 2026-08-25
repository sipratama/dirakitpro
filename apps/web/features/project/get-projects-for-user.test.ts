import { courses, db, enrollments, projects, type NewCourse, users } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { grantEnrollment } from "../commerce/grant-enrollment";
import { afterEach, describe, expect, it } from "vitest";
import { getProjectsForUser } from "./get-projects-for-user";

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

describe("getProjectsForUser", () => {
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

  it("returns an empty list for a learner with no enrollment", async () => {
    const learner = await insertLearner();
    userIds.push(learner.id);

    const result = await getProjectsForUser(learner.id);

    expect(result).toHaveLength(0);
  });

  it("returns the learner's own projects with the course title, and none of another learner's", async () => {
    const courseA = await insertCourse({ title: "Rakitan Pertama" });
    const courseB = await insertCourse({ title: "Rakit Sistem Booking" });
    courseIds.push(courseA.id, courseB.id);
    const learner = await insertLearner();
    const other = await insertLearner();
    userIds.push(learner.id, other.id);

    await grantEnrollment(learner.id, courseA.id);
    await grantEnrollment(learner.id, courseB.id);
    await grantEnrollment(other.id, courseA.id);

    const result = await getProjectsForUser(learner.id);

    expect(result).toHaveLength(2);
    expect(result.map((p) => p.courseTitle).sort()).toEqual(["Rakit Sistem Booking", "Rakitan Pertama"]);
    expect(result.every((p) => p.userId === learner.id)).toBe(true);
  });
});
