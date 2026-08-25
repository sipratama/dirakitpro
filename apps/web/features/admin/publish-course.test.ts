import { courses, db, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { CoursePriceInvalidError } from "./errors";
import { publishCourse } from "./publish-course";

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
      status: "DRAFT",
      ...overrides,
    })
    .returning();
  return course;
}

describe("publishCourse", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("always allows publishing a FREE course (price = 0)", async () => {
    const course = await insertCourse({ price: "0" });
    courseIds.push(course.id);

    const published = await publishCourse(course.id);
    expect(published.status).toBe("PUBLISHED");
    expect(published.publishedAt).not.toBeNull();
  });

  it("allows publishing a paid course with a valid price > 0", async () => {
    const course = await insertCourse({ price: "149000" });
    courseIds.push(course.id);

    const published = await publishCourse(course.id);
    expect(published.status).toBe("PUBLISHED");
  });

  it("rejects publishing a course whose stored price is negative (COM-001)", async () => {
    const course = await insertCourse({ price: "-1" });
    courseIds.push(course.id);

    await expect(publishCourse(course.id)).rejects.toThrow(CoursePriceInvalidError);
  });

  it("is idempotent about publishedAt on re-publish", async () => {
    const course = await insertCourse({ price: "0" });
    courseIds.push(course.id);

    const first = await publishCourse(course.id);
    await db.update(courses).set({ status: "UNPUBLISHED" }).where(inArray(courses.id, [course.id]));
    const second = await publishCourse(course.id);

    expect(second.publishedAt?.getTime()).toBe(first.publishedAt?.getTime());
  });
});
