import { courses, courseStages, db, lessons, type NewCourse } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getCourseCurriculumSummary } from "./get-course-curriculum-summary";

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

describe("getCourseCurriculumSummary", () => {
  let courseId: string;

  afterEach(async () => {
    if (courseId) await db.delete(courses).where(eq(courses.id, courseId)); // cascades stages/lessons
  });

  it("orders stages and lessons by position and omits lesson content entirely", async () => {
    const course = await insertCourse();
    courseId = course.id;

    // Insert stages/lessons out of natural order to prove sorting isn't accidental.
    const [stageTwo] = await db
      .insert(courseStages)
      .values({ courseId, title: "Stage Two", position: 2 })
      .returning();
    const [stageOne] = await db
      .insert(courseStages)
      .values({ courseId, title: "Stage One", position: 1 })
      .returning();

    await db.insert(lessons).values([
      {
        courseId,
        courseStageId: stageOne.id,
        slug: uniqueSlug("lesson"),
        title: "Concept: intro",
        type: "CONCEPT",
        position: 2,
        content: { secret: "should never leave this table" },
      },
      {
        courseId,
        courseStageId: stageOne.id,
        slug: uniqueSlug("lesson"),
        title: "Build: make it visible",
        type: "BUILD",
        position: 1,
        content: { secret: "should never leave this table" },
      },
      {
        courseId,
        courseStageId: stageTwo.id,
        slug: uniqueSlug("lesson"),
        title: "Deploy: put it online",
        type: "DEPLOY",
        position: 1,
        content: { secret: "should never leave this table" },
      },
    ]);

    const summary = await getCourseCurriculumSummary(courseId);

    expect(summary.map((s) => s.title)).toEqual(["Stage One", "Stage Two"]);
    expect(summary[0].lessons.map((l) => l.title)).toEqual(["Build: make it visible", "Concept: intro"]);
    expect(summary[1].lessons.map((l) => l.title)).toEqual(["Deploy: put it online"]);
    expect(summary[0].lessons[0].type).toBe("BUILD");

    const serialized = JSON.stringify(summary);
    expect(serialized).not.toContain("content");
    expect(serialized).not.toContain("should never leave this table");
  });

  it("returns a stage with an empty lesson list rather than omitting it", async () => {
    const course = await insertCourse();
    courseId = course.id;
    await db.insert(courseStages).values({ courseId, title: "Empty Stage", position: 1 });

    const summary = await getCourseCurriculumSummary(courseId);

    expect(summary).toHaveLength(1);
    expect(summary[0].lessons).toEqual([]);
  });
});
