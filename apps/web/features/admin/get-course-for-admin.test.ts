import { courses, db, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getCourseForAdmin } from "./get-course-for-admin";

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
      ...overrides,
    })
    .returning();
  return course;
}

describe("getCourseForAdmin", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("returns the course for a valid id", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);

    expect((await getCourseForAdmin(course.id))?.id).toBe(course.id);
  });

  it("returns null for a well-formed but nonexistent id", async () => {
    expect(await getCourseForAdmin("00000000-0000-0000-0000-000000000000")).toBeNull();
  });

  it("returns null for a malformed id without hitting the DB with an invalid uuid literal", async () => {
    expect(await getCourseForAdmin("not-a-uuid")).toBeNull();
  });
});
