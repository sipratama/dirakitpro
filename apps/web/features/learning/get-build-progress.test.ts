import { buildMilestones, buildProgress, courses, db, type NewCourse, users } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getBuildProgress } from "./get-build-progress";

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

async function insertLearner() {
  const [user] = await db
    .insert(users)
    .values({
      email: `${uniqueSlug("learner")}@example.com`,
      username: uniqueSlug("learner"),
      displayName: "Test Learner",
      role: "LEARNER",
    })
    .returning();
  return user;
}

describe("getBuildProgress", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds)); // cascades milestones/progress
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("returns ratio 0 with totalRequired 0 when the course has no REQUIRED milestone", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(buildMilestones).values({ courseId: course.id, title: "Optional one", position: 1, isRequired: false });

    const progress = await getBuildProgress(learner.id, course.id);

    expect(progress).toEqual({ completedCount: 0, totalRequired: 0, ratio: 0 });
  });

  it("computes the ratio from REQUIRED milestones only, ignoring OPTIONAL ones", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const [m1] = await db
      .insert(buildMilestones)
      .values({ courseId: course.id, title: "Shell", position: 1, isRequired: true })
      .returning();
    await db.insert(buildMilestones).values({ courseId: course.id, title: "Database", position: 2, isRequired: true });
    await db.insert(buildMilestones).values({ courseId: course.id, title: "Bonus", position: 3, isRequired: false });

    await db.insert(buildProgress).values({ userId: learner.id, buildMilestoneId: m1.id, status: "COMPLETED" });

    const progress = await getBuildProgress(learner.id, course.id);

    expect(progress).toEqual({ completedCount: 1, totalRequired: 2, ratio: 0.5 });
  });

  it("does not count a NOT_STARTED BuildProgress row as completed", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const [m1] = await db
      .insert(buildMilestones)
      .values({ courseId: course.id, title: "Shell", position: 1, isRequired: true })
      .returning();
    await db.insert(buildProgress).values({ userId: learner.id, buildMilestoneId: m1.id, status: "NOT_STARTED" });

    const progress = await getBuildProgress(learner.id, course.id);

    expect(progress).toEqual({ completedCount: 0, totalRequired: 1, ratio: 0 });
  });
});
