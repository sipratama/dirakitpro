import { courses, db, enrollments, type NewCourse, users } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getPublishedCourses } from "./get-published-courses";

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

describe("getPublishedCourses", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (userIds.length) await db.delete(enrollments).where(inArray(enrollments.userId, userIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("excludes DRAFT and UNPUBLISHED courses (CAT-003)", async () => {
    const published = await insertCourse({ status: "PUBLISHED" });
    const draft = await insertCourse({ status: "DRAFT" });
    const unpublished = await insertCourse({ status: "UNPUBLISHED" });
    courseIds.push(published.id, draft.id, unpublished.id);

    const result = await getPublishedCourses();
    const resultIds = result.map((c) => c.id);

    expect(resultIds).toContain(published.id);
    expect(resultIds).not.toContain(draft.id);
    expect(resultIds).not.toContain(unpublished.id);
  });

  it("includes a PUBLISHED course with price 0 with no special handling (CAT-004)", async () => {
    const freeCourse = await insertCourse({ status: "PUBLISHED", price: "0" });
    courseIds.push(freeCourse.id);

    const result = await getPublishedCourses();
    const found = result.find((c) => c.id === freeCourse.id);

    expect(found).toBeDefined();
    expect(found?.price).toBe("0.00");
  });

  it("marks isOwned true only for the course the learner actually holds (CAT-006)", async () => {
    const owned = await insertCourse({ status: "PUBLISHED" });
    const notOwned = await insertCourse({ status: "PUBLISHED" });
    courseIds.push(owned.id, notOwned.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(enrollments).values({ userId: learner.id, courseId: owned.id, status: "ACTIVE" });

    const result = await getPublishedCourses(learner.id);

    expect(result.find((c) => c.id === owned.id)?.isOwned).toBe(true);
    expect(result.find((c) => c.id === notOwned.id)?.isOwned).toBe(false);
  });

  it("never reports isOwned true for a guest (no userId)", async () => {
    const owned = await insertCourse({ status: "PUBLISHED" });
    courseIds.push(owned.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(enrollments).values({ userId: learner.id, courseId: owned.id, status: "ACTIVE" });

    const result = await getPublishedCourses();

    expect(result.every((c) => c.isOwned === false)).toBe(true);
  });
});
