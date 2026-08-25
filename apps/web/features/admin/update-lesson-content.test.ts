import { courseStages, courses, db, lessons, type NewCourse } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { InvalidLessonContentError, LessonNotFoundError } from "./errors";
import { updateLessonContent } from "./update-lesson-content";

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

async function insertLesson(courseId: string, content: unknown[] = []) {
  const [stage] = await db.insert(courseStages).values({ courseId, title: "Stage", position: 1 }).returning();
  const [lesson] = await db
    .insert(lessons)
    .values({
      courseId,
      courseStageId: stage.id,
      slug: uniqueSlug("lesson"),
      title: "Lesson",
      type: "CONCEPT",
      position: 1,
      content,
    })
    .returning();
  return lesson;
}

describe("updateLessonContent", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("saves valid content with all 6 block types", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const lesson = await insertLesson(course.id);

    const blocks = [
      { type: "markdown", markdown: "# Hi" },
      { type: "code", language: "ts", code: "const x = 1;" },
      { type: "image", url: "https://example.com/a.png", alt: "alt" },
      { type: "video", provider: "youtube", videoId: "abc123" },
      { type: "resource_link", label: "Repo", url: "https://github.com/example/repo" },
      { type: "task", items: [{ id: "1", label: "Do the thing" }] },
    ];

    const updated = await updateLessonContent(lesson.id, JSON.stringify(blocks));
    expect(updated.content).toEqual(blocks);
  });

  it("saves a video block with a non-youtube provider (not rejected, Appendix F)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const lesson = await insertLesson(course.id);

    const blocks = [{ type: "video", provider: "vimeo", videoId: "xyz" }];
    const updated = await updateLessonContent(lesson.id, JSON.stringify(blocks));
    expect(updated.content).toEqual(blocks);
  });

  it("rejects invalid JSON and leaves the existing content unchanged", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const original = [{ type: "markdown", markdown: "original" }];
    const lesson = await insertLesson(course.id, original);

    await expect(updateLessonContent(lesson.id, "{not valid")).rejects.toThrow(InvalidLessonContentError);

    const [reloaded] = await db.select().from(lessons).where(eq(lessons.id, lesson.id));
    expect(reloaded.content).toEqual(original);
  });

  it("rejects a block with an unrecognized type and leaves content unchanged", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const original = [{ type: "markdown", markdown: "original" }];
    const lesson = await insertLesson(course.id, original);

    await expect(updateLessonContent(lesson.id, JSON.stringify([{ type: "quiz" }]))).rejects.toThrow(
      InvalidLessonContentError,
    );

    const [reloaded] = await db.select().from(lessons).where(eq(lessons.id, lesson.id));
    expect(reloaded.content).toEqual(original);
  });

  it("throws for a nonexistent lesson id", async () => {
    await expect(updateLessonContent("00000000-0000-0000-0000-000000000000", "[]")).rejects.toThrow(LessonNotFoundError);
  });
});
