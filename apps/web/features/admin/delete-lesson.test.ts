import { courseStages, courses, db, lessons, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createLesson, type LessonInput } from "./create-lesson";
import { deleteLesson } from "./delete-lesson";
import { LessonNotFoundError } from "./errors";

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

function baseInput(overrides: Partial<LessonInput> = {}): LessonInput {
  return {
    slug: uniqueSlug("test-lesson"),
    title: "Test Lesson",
    type: "CONCEPT",
    isRequired: true,
    buildMilestoneId: null,
    ...overrides,
  };
}

describe("deleteLesson", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("deletes an existing lesson", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();
    const lesson = await createLesson(stage.id, baseInput());

    await deleteLesson(lesson.id);

    const rows = await db.select().from(lessons).where(inArray(lessons.id, [lesson.id]));
    expect(rows).toHaveLength(0);
  });

  it("throws for a nonexistent lesson id", async () => {
    await expect(deleteLesson("00000000-0000-0000-0000-000000000000")).rejects.toThrow(LessonNotFoundError);
  });
});
