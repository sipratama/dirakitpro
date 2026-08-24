import { courses, courseStages, db, lessons, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getLessonBySlug } from "./get-lesson-by-slug";

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

async function insertLesson(courseId: string, slug: string) {
  const [stage] = await db.insert(courseStages).values({ courseId, title: "Stage", position: 1 }).returning();
  const [lesson] = await db
    .insert(lessons)
    .values({ courseId, courseStageId: stage.id, slug, title: "Lesson", type: "BUILD", position: 1, content: [] })
    .returning();
  return lesson;
}

describe("getLessonBySlug", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("returns the lesson when it belongs to the given course", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const lesson = await insertLesson(course.id, "intro");

    expect((await getLessonBySlug(course.id, "intro"))?.id).toBe(lesson.id);
  });

  it("returns null when the lesson exists but belongs to a different course", async () => {
    const courseA = await insertCourse();
    courseIds.push(courseA.id);
    const courseB = await insertCourse();
    courseIds.push(courseB.id);
    await insertLesson(courseA.id, "intro");

    expect(await getLessonBySlug(courseB.id, "intro")).toBeNull();
  });

  it("returns null when no lesson has that slug at all", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);

    expect(await getLessonBySlug(course.id, "does-not-exist")).toBeNull();
  });
});
