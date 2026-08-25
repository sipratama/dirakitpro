import { courseStages, courses, db, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { CourseStageNotFoundError } from "./errors";
import { updateCourseStage } from "./update-course-stage";

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

describe("updateCourseStage", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("updates the stage's title", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Old", position: 1 }).returning();

    const updated = await updateCourseStage(stage.id, "New");
    expect(updated.title).toBe("New");
  });

  it("throws for a nonexistent stage id", async () => {
    await expect(updateCourseStage("00000000-0000-0000-0000-000000000000", "x")).rejects.toThrow(CourseStageNotFoundError);
  });

  it("throws for a malformed stage id", async () => {
    await expect(updateCourseStage("not-a-uuid", "x")).rejects.toThrow(CourseStageNotFoundError);
  });
});
