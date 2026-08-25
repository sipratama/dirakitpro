import { courseStages, courses, db, type NewCourse } from "@dirakitpro/database";
import { asc, eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { ReorderSetMismatchError } from "./errors";
import { reorderCourseStages } from "./reorder-course-stages";

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

describe("reorderCourseStages", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("persists the new order in one go", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [a] = await db.insert(courseStages).values({ courseId: course.id, title: "A", position: 1 }).returning();
    const [b] = await db.insert(courseStages).values({ courseId: course.id, title: "B", position: 2 }).returning();

    await reorderCourseStages(course.id, [b.id, a.id]);

    const rows = await db.select().from(courseStages).where(eq(courseStages.courseId, course.id)).orderBy(asc(courseStages.position));
    expect(rows.map((r) => r.id)).toEqual([b.id, a.id]);
    expect(rows.map((r) => r.position)).toEqual([1, 2]);
  });

  it("rejects when the given ids don't match the current set (missing one)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    await db.insert(courseStages).values({ courseId: course.id, title: "A", position: 1 }).returning();
    const [b] = await db.insert(courseStages).values({ courseId: course.id, title: "B", position: 2 }).returning();

    await expect(reorderCourseStages(course.id, [b.id])).rejects.toThrow(ReorderSetMismatchError);
  });

  it("rejects when the given ids include one that doesn't belong to this course", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const other = await insertCourse();
    courseIds.push(other.id);
    const [a] = await db.insert(courseStages).values({ courseId: course.id, title: "A", position: 1 }).returning();
    const [foreign] = await db.insert(courseStages).values({ courseId: other.id, title: "Foreign", position: 1 }).returning();

    await expect(reorderCourseStages(course.id, [a.id, foreign.id])).rejects.toThrow(ReorderSetMismatchError);
  });
});
