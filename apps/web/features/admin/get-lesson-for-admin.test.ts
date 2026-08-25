import { courseStages, courses, db, lessons, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getLessonForAdmin } from "./get-lesson-for-admin";

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

describe("getLessonForAdmin", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("returns the lesson for a valid id", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();
    const [lesson] = await db
      .insert(lessons)
      .values({ courseId: course.id, courseStageId: stage.id, slug: uniqueSlug("lesson"), title: "Lesson", type: "CONCEPT", position: 1 })
      .returning();

    expect((await getLessonForAdmin(lesson.id))?.id).toBe(lesson.id);
  });

  it("returns null for a well-formed but nonexistent id", async () => {
    expect(await getLessonForAdmin("00000000-0000-0000-0000-000000000000")).toBeNull();
  });

  it("returns null for a malformed id", async () => {
    expect(await getLessonForAdmin("not-a-uuid")).toBeNull();
  });
});
