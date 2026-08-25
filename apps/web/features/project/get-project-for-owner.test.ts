import { courses, db, enrollments, projects, type NewCourse, users } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { grantEnrollment } from "../commerce/grant-enrollment";
import { afterEach, describe, expect, it } from "vitest";
import { getProjectForOwner } from "./get-project-for-owner";

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

describe("getProjectForOwner", () => {
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

  it("returns the project for its owner", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await grantEnrollment(learner.id, course.id);
    const [project] = await db.select().from(projects).where(eq(projects.userId, learner.id));

    const result = await getProjectForOwner(project.id, learner.id);

    expect(result?.id).toBe(project.id);
  });

  it("returns null when the project belongs to a different user, without distinguishing from not-found", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const owner = await insertLearner();
    const intruder = await insertLearner();
    userIds.push(owner.id, intruder.id);
    await grantEnrollment(owner.id, course.id);
    const [project] = await db.select().from(projects).where(eq(projects.userId, owner.id));

    const result = await getProjectForOwner(project.id, intruder.id);

    expect(result).toBeNull();
  });

  it("returns null for a nonexistent project id", async () => {
    const learner = await insertLearner();
    userIds.push(learner.id);

    const result = await getProjectForOwner("00000000-0000-0000-0000-000000000000", learner.id);

    expect(result).toBeNull();
  });

  it("returns null (not a DB error) for a malformed projectId that isn't a valid UUID", async () => {
    const learner = await insertLearner();
    userIds.push(learner.id);

    const result = await getProjectForOwner("not-a-uuid", learner.id);

    expect(result).toBeNull();
  });
});
