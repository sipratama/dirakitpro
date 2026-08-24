import { courses, courseStages, db, lessons, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getAdjacentLessons } from "./get-adjacent-lessons";

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

async function insertOrderedLessons(courseId: string, titles: string[]) {
  const [stage] = await db.insert(courseStages).values({ courseId, title: "Stage", position: 1 }).returning();
  return db
    .insert(lessons)
    .values(
      titles.map((title, index) => ({
        courseId,
        courseStageId: stage.id,
        slug: uniqueSlug("lesson"),
        title,
        type: "BUILD" as const,
        position: index + 1,
        content: [],
      })),
    )
    .returning();
}

describe("getAdjacentLessons", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("returns previous=null for the first lesson and the correct next", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [l1, l2] = await insertOrderedLessons(course.id, ["L1", "L2", "L3"]);

    const adjacent = await getAdjacentLessons(course.id, l1.id);
    expect(adjacent.previous).toBeNull();
    expect(adjacent.next?.id).toBe(l2.id);
  });

  it("returns next=null for the last lesson and the correct previous", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [, l2, l3] = await insertOrderedLessons(course.id, ["L1", "L2", "L3"]);

    const adjacent = await getAdjacentLessons(course.id, l3.id);
    expect(adjacent.previous?.id).toBe(l2.id);
    expect(adjacent.next).toBeNull();
  });

  it("returns both null when the lesson isn't found in this course", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    await insertOrderedLessons(course.id, ["L1"]);

    const adjacent = await getAdjacentLessons(course.id, "00000000-0000-0000-0000-000000000000");
    expect(adjacent).toEqual({ previous: null, next: null });
  });
});
