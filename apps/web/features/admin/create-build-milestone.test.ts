import { buildMilestones, courses, db, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createBuildMilestone } from "./create-build-milestone";

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

describe("createBuildMilestone", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("creates the first milestone at position 1", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);

    const milestone = await createBuildMilestone(course.id, "Live di internet", true);
    expect(milestone.position).toBe(1);
    expect(milestone.title).toBe("Live di internet");
    expect(milestone.isRequired).toBe(true);
  });

  it("appends subsequent milestones at the end", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);

    await createBuildMilestone(course.id, "M1", true);
    const second = await createBuildMilestone(course.id, "M2", false);
    expect(second.position).toBe(2);

    const rows = await db.select().from(buildMilestones).where(inArray(buildMilestones.courseId, [course.id]));
    expect(rows).toHaveLength(2);
  });
});
