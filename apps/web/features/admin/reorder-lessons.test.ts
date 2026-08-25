import { courseStages, courses, db, lessons, type NewCourse } from "@dirakitpro/database";
import { asc, eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createLesson, type LessonInput } from "./create-lesson";
import { ReorderSetMismatchError } from "./errors";
import { reorderLessons } from "./reorder-lessons";

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

describe("reorderLessons", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("persists the new order in one go", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();
    const a = await createLesson(stage.id, baseInput({ title: "A" }));
    const b = await createLesson(stage.id, baseInput({ title: "B" }));

    await reorderLessons(stage.id, [b.id, a.id]);

    const rows = await db.select().from(lessons).where(eq(lessons.courseStageId, stage.id)).orderBy(asc(lessons.position));
    expect(rows.map((r) => r.id)).toEqual([b.id, a.id]);
    expect(rows.map((r) => r.position)).toEqual([1, 2]);
  });

  it("rejects when the given ids don't match the current set", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();
    await createLesson(stage.id, baseInput());
    const b = await createLesson(stage.id, baseInput());

    await expect(reorderLessons(stage.id, [b.id])).rejects.toThrow(ReorderSetMismatchError);
  });
});
