import { buildMilestones, courses, db, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { BuildMilestoneNotFoundError } from "./errors";
import { updateBuildMilestone } from "./update-build-milestone";

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

describe("updateBuildMilestone", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("updates title and isRequired", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const [milestone] = await db
      .insert(buildMilestones)
      .values({ courseId: course.id, title: "Old", position: 1, isRequired: true })
      .returning();

    const updated = await updateBuildMilestone(milestone.id, "New", false);
    expect(updated.title).toBe("New");
    expect(updated.isRequired).toBe(false);
  });

  it("throws for a nonexistent milestone id", async () => {
    await expect(updateBuildMilestone("00000000-0000-0000-0000-000000000000", "x", true)).rejects.toThrow(
      BuildMilestoneNotFoundError,
    );
  });

  it("throws for a malformed milestone id", async () => {
    await expect(updateBuildMilestone("not-a-uuid", "x", true)).rejects.toThrow(BuildMilestoneNotFoundError);
  });
});
