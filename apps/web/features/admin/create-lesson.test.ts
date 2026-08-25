import { buildMilestones, courseStages, courses, db, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createLesson, type LessonInput } from "./create-lesson";
import { BuildMilestoneNotFoundError, CourseStageNotFoundError, InvalidSlugFormatError, SlugConflictError } from "./errors";

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

describe("createLesson", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("creates the first lesson in a stage at position 1", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();

    const lesson = await createLesson(stage.id, baseInput());
    expect(lesson.position).toBe(1);
    expect(lesson.courseId).toBe(course.id);
    expect(lesson.content).toEqual([]);
  });

  it("appends subsequent lessons within the same stage", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();

    await createLesson(stage.id, baseInput());
    const second = await createLesson(stage.id, baseInput());
    expect(second.position).toBe(2);
  });

  it("rejects an invalid slug format", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();

    await expect(createLesson(stage.id, baseInput({ slug: "Bad Slug!" }))).rejects.toThrow(InvalidSlugFormatError);
  });

  it("rejects a slug already used elsewhere in the same course", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();
    const slug = uniqueSlug("dup");
    await createLesson(stage.id, baseInput({ slug }));

    await expect(createLesson(stage.id, baseInput({ slug }))).rejects.toThrow(SlugConflictError);
  });

  it("throws for a nonexistent stage id", async () => {
    await expect(createLesson("00000000-0000-0000-0000-000000000000", baseInput())).rejects.toThrow(CourseStageNotFoundError);
  });

  it("rejects a buildMilestoneId that doesn't belong to this course", async () => {
    const course = await insertCourse();
    const other = await insertCourse();
    courseIds.push(course.id, other.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();
    const [foreignMilestone] = await db
      .insert(buildMilestones)
      .values({ courseId: other.id, title: "Foreign", position: 1, isRequired: true })
      .returning();

    await expect(createLesson(stage.id, baseInput({ buildMilestoneId: foreignMilestone.id }))).rejects.toThrow(
      BuildMilestoneNotFoundError,
    );
  });

  it("accepts a buildMilestoneId that belongs to this course", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();
    const [milestone] = await db
      .insert(buildMilestones)
      .values({ courseId: course.id, title: "Milestone", position: 1, isRequired: true })
      .returning();

    const lesson = await createLesson(stage.id, baseInput({ buildMilestoneId: milestone.id, type: "CHECKPOINT" }));
    expect(lesson.buildMilestoneId).toBe(milestone.id);
  });
});
