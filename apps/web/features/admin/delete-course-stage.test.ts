import { courseStages, courses, db, lessons, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { CourseStageNotEmptyError, CourseStageNotFoundError } from "./errors";
import { deleteCourseStage } from "./delete-course-stage";

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

describe("deleteCourseStage", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("deletes an empty stage", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();

    await deleteCourseStage(stage.id);

    const rows = await db.select().from(courseStages).where(inArray(courseStages.id, [stage.id]));
    expect(rows).toHaveLength(0);
  });

  it("rejects deleting a stage that still has lessons", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();
    await db.insert(lessons).values({
      courseId: course.id,
      courseStageId: stage.id,
      slug: uniqueSlug("lesson"),
      title: "Lesson",
      type: "CONCEPT",
      position: 1,
    });

    await expect(deleteCourseStage(stage.id)).rejects.toThrow(CourseStageNotEmptyError);
  });

  it("throws for a nonexistent stage id", async () => {
    await expect(deleteCourseStage("00000000-0000-0000-0000-000000000000")).rejects.toThrow(CourseStageNotFoundError);
  });
});
