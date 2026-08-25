import { courseStages, courses, db, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createLesson, type LessonInput } from "./create-lesson";
import { InvalidSlugFormatError, LessonNotFoundError, SlugConflictError } from "./errors";
import { updateLesson } from "./update-lesson";

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

describe("updateLesson", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("updates fields on an existing lesson", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();
    const lesson = await createLesson(stage.id, baseInput());

    const updated = await updateLesson(lesson.id, baseInput({ slug: lesson.slug, title: "New Title", type: "BUILD" }));
    expect(updated.title).toBe("New Title");
    expect(updated.type).toBe("BUILD");
  });

  it("throws for a nonexistent lesson id", async () => {
    await expect(updateLesson("00000000-0000-0000-0000-000000000000", baseInput())).rejects.toThrow(LessonNotFoundError);
  });

  it("rejects an invalid slug format", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();
    const lesson = await createLesson(stage.id, baseInput());

    await expect(updateLesson(lesson.id, baseInput({ slug: "Bad Slug!" }))).rejects.toThrow(InvalidSlugFormatError);
  });

  it("rejects a slug already used by a different lesson in the same course", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();
    const lessonA = await createLesson(stage.id, baseInput());
    const lessonB = await createLesson(stage.id, baseInput());

    await expect(updateLesson(lessonB.id, baseInput({ slug: lessonA.slug }))).rejects.toThrow(SlugConflictError);
  });

  it("allows keeping the lesson's own slug unchanged", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();
    const lesson = await createLesson(stage.id, baseInput());

    const updated = await updateLesson(lesson.id, baseInput({ slug: lesson.slug, title: "Renamed" }));
    expect(updated.slug).toBe(lesson.slug);
    expect(updated.title).toBe("Renamed");
  });
});
