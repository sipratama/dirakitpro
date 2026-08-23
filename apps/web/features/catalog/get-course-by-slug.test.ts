import { courses, db, enrollments, type NewCourse, users } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getCourseBySlug } from "./get-course-by-slug";

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

describe("getCourseBySlug", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (userIds.length) await db.delete(enrollments).where(inArray(enrollments.userId, userIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("returns null for a slug that doesn't exist", async () => {
    const result = await getCourseBySlug(uniqueSlug("nonexistent"));
    expect(result).toBeNull();
  });

  it("returns null for a DRAFT course (CAT-003 — not-found for the public catalog)", async () => {
    const draft = await insertCourse({ status: "DRAFT" });
    courseIds.push(draft.id);

    const result = await getCourseBySlug(draft.slug);
    expect(result).toBeNull();
  });

  it("returns null for an UNPUBLISHED course", async () => {
    const unpublished = await insertCourse({ status: "UNPUBLISHED" });
    courseIds.push(unpublished.id);

    const result = await getCourseBySlug(unpublished.slug);
    expect(result).toBeNull();
  });

  it("returns a PUBLISHED course with isOwned reflecting the learner's enrollment (CAT-006)", async () => {
    const course = await insertCourse({ status: "PUBLISHED" });
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(enrollments).values({ userId: learner.id, courseId: course.id, status: "ACTIVE" });

    const asOwner = await getCourseBySlug(course.slug, learner.id);
    const asGuest = await getCourseBySlug(course.slug);

    expect(asOwner?.isOwned).toBe(true);
    expect(asGuest?.isOwned).toBe(false);
  });
});
