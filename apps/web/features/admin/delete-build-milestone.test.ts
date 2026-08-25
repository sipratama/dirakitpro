import { buildMilestones, courseStages, courses, db, lessons, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { deleteBuildMilestone } from "./delete-build-milestone";
import { BuildMilestoneInUseError, BuildMilestoneNotFoundError } from "./errors";

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

describe("deleteBuildMilestone", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("deletes a milestone with no referencing lessons", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [milestone] = await db
      .insert(buildMilestones)
      .values({ courseId: course.id, title: "M1", position: 1, isRequired: true })
      .returning();

    await deleteBuildMilestone(milestone.id);

    const rows = await db.select().from(buildMilestones).where(inArray(buildMilestones.id, [milestone.id]));
    expect(rows).toHaveLength(0);
  });

  it("rejects deleting a milestone still referenced by a lesson, with the reference count in the message", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage", position: 1 }).returning();
    const [milestone] = await db
      .insert(buildMilestones)
      .values({ courseId: course.id, title: "M1", position: 1, isRequired: true })
      .returning();
    await db.insert(lessons).values({
      courseId: course.id,
      courseStageId: stage.id,
      slug: uniqueSlug("lesson"),
      title: "Checkpoint",
      type: "CHECKPOINT",
      position: 1,
      buildMilestoneId: milestone.id,
    });

    await expect(deleteBuildMilestone(milestone.id)).rejects.toThrow(BuildMilestoneInUseError);
    await expect(deleteBuildMilestone(milestone.id)).rejects.toThrow(/1 lesson/);
  });

  it("throws for a nonexistent milestone id", async () => {
    await expect(deleteBuildMilestone("00000000-0000-0000-0000-000000000000")).rejects.toThrow(BuildMilestoneNotFoundError);
  });
});
