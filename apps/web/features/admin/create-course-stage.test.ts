import { courseStages, courses, db, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createCourseStage } from "./create-course-stage";

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

describe("createCourseStage", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("creates the first stage at position 1", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);

    const stage = await createCourseStage(course.id, "Stage 1");
    expect(stage.position).toBe(1);
    expect(stage.title).toBe("Stage 1");
  });

  it("appends subsequent stages at the end", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);

    await createCourseStage(course.id, "Stage 1");
    const second = await createCourseStage(course.id, "Stage 2");
    expect(second.position).toBe(2);

    const rows = await db.select().from(courseStages).where(inArray(courseStages.courseId, [course.id]));
    expect(rows).toHaveLength(2);
  });
});
