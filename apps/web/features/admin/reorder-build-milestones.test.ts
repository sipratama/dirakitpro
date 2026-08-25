import { buildMilestones, courseStages, courses, db, lessons, type NewCourse } from "@dirakitpro/database";
import { asc, eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { ReorderSetMismatchError } from "./errors";
import { reorderBuildMilestones } from "./reorder-build-milestones";

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

describe("reorderBuildMilestones", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("persists the new order in one go", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [a] = await db.insert(buildMilestones).values({ courseId: course.id, title: "A", position: 1, isRequired: true }).returning();
    const [b] = await db.insert(buildMilestones).values({ courseId: course.id, title: "B", position: 2, isRequired: true }).returning();

    await reorderBuildMilestones(course.id, [b.id, a.id]);

    const rows = await db.select().from(buildMilestones).where(eq(buildMilestones.courseId, course.id)).orderBy(asc(buildMilestones.position));
    expect(rows.map((r) => r.id)).toEqual([b.id, a.id]);
    expect(rows.map((r) => r.position)).toEqual([1, 2]);
  });

  it("does not change existing lesson->milestone relations", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();
    const [a] = await db.insert(buildMilestones).values({ courseId: course.id, title: "A", position: 1, isRequired: true }).returning();
    const [b] = await db.insert(buildMilestones).values({ courseId: course.id, title: "B", position: 2, isRequired: true }).returning();
    const [lesson] = await db
      .insert(lessons)
      .values({
        courseId: course.id,
        courseStageId: stage.id,
        slug: uniqueSlug("lesson"),
        title: "Checkpoint",
        type: "CHECKPOINT",
        position: 1,
        buildMilestoneId: a.id,
      })
      .returning();

    await reorderBuildMilestones(course.id, [b.id, a.id]);

    const [reloadedLesson] = await db.select().from(lessons).where(eq(lessons.id, lesson.id));
    expect(reloadedLesson.buildMilestoneId).toBe(a.id);
  });

  it("rejects when the given ids don't match the current set", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    await db.insert(buildMilestones).values({ courseId: course.id, title: "A", position: 1, isRequired: true }).returning();
    const [b] = await db.insert(buildMilestones).values({ courseId: course.id, title: "B", position: 2, isRequired: true }).returning();

    await expect(reorderBuildMilestones(course.id, [b.id])).rejects.toThrow(ReorderSetMismatchError);
  });
});
