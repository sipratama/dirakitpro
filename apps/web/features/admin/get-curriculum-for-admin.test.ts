import { buildMilestones, courseStages, courses, db, lessons, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getCurriculumForAdmin } from "./get-curriculum-for-admin";

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

describe("getCurriculumForAdmin", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds)); // cascades stages/lessons/milestones
    courseIds.length = 0;
  });

  it("returns an empty outline for a course with no stages/lessons/milestones", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);

    const result = await getCurriculumForAdmin(course.id);
    expect(result.stages).toEqual([]);
    expect(result.milestones).toEqual([]);
  });

  it("groups lessons under their stage, ordered by position, with milestones listed separately", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);

    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage 1", position: 1 }).returning();
    const [milestone] = await db
      .insert(buildMilestones)
      .values({ courseId: course.id, title: "Milestone 1", position: 1, isRequired: true })
      .returning();
    await db.insert(lessons).values([
      {
        courseId: course.id,
        courseStageId: stage.id,
        slug: uniqueSlug("lesson-b"),
        title: "Lesson B",
        type: "CONCEPT",
        position: 2,
      },
      {
        courseId: course.id,
        courseStageId: stage.id,
        slug: uniqueSlug("lesson-a"),
        title: "Lesson A",
        type: "CHECKPOINT",
        position: 1,
        buildMilestoneId: milestone.id,
      },
    ]);

    const result = await getCurriculumForAdmin(course.id);

    expect(result.stages).toHaveLength(1);
    expect(result.stages[0]?.lessons.map((l) => l.title)).toEqual(["Lesson A", "Lesson B"]);
    expect(result.stages[0]?.lessons[0]?.buildMilestoneId).toBe(milestone.id);
    expect(result.milestones).toHaveLength(1);
    expect(result.milestones[0]?.title).toBe("Milestone 1");
  });
});
