import { courses, db, enrollments, projects, type NewCourse, users } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { grantEnrollment } from "../commerce/grant-enrollment";
import { afterEach, describe, expect, it } from "vitest";
import { getProjectForModeration } from "./get-project-for-moderation";

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

describe("getProjectForModeration", () => {
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

  it("returns full project detail with learner and course info, with no ownership check", async () => {
    const course = await insertCourse({ title: "Rakit Sistem Booking Bisnis" });
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await grantEnrollment(learner.id, course.id);
    const [project] = await db.select().from(projects).where(eq(projects.userId, learner.id));

    // A DIFFERENT admin user id is passed here (this function has no owner
    // concept at all) — it must still resolve, unlike getProjectForOwner.
    const result = await getProjectForModeration(project.id);

    expect(result?.id).toBe(project.id);
    expect(result?.learnerDisplayName).toBe(learner.displayName);
    expect(result?.learnerUsername).toBe(learner.username);
    expect(result?.courseTitle).toBe("Rakit Sistem Booking Bisnis");
  });

  it("returns null for a nonexistent project id", async () => {
    const result = await getProjectForModeration("00000000-0000-0000-0000-000000000000");
    expect(result).toBeNull();
  });

  it("returns null (not a DB error) for a malformed projectId that isn't a valid UUID", async () => {
    const result = await getProjectForModeration("not-a-uuid");
    expect(result).toBeNull();
  });
});
