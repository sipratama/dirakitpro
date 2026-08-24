import {
  buildMilestones,
  buildProgress,
  courses,
  courseStages,
  db,
  lessons,
  type NewCourse,
  users,
} from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { deriveBuildMilestoneCompletion } from "./derive-build-milestone-completion";
import { markLessonComplete } from "./mark-lesson-complete";

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

async function setupMilestoneWithCheckpoints(
  courseId: string,
  checkpoints: Array<{ isRequired: boolean }>,
) {
  const [stage] = await db.insert(courseStages).values({ courseId, title: "Stage", position: 1 }).returning();
  const [milestone] = await db
    .insert(buildMilestones)
    .values({ courseId, title: "Database", position: 1, isRequired: true })
    .returning();

  const lessonRows = await db
    .insert(lessons)
    .values(
      checkpoints.map((cp, index) => ({
        courseId,
        courseStageId: stage.id,
        buildMilestoneId: milestone.id,
        slug: uniqueSlug("checkpoint"),
        title: `Checkpoint ${index + 1}`,
        type: "CHECKPOINT" as const,
        position: index + 1,
        isRequired: cp.isRequired,
        content: [],
      })),
    )
    .returning();

  return { milestone, checkpointLessons: lessonRows };
}

describe("deriveBuildMilestoneCompletion", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds)); // cascades milestones/lessons/progress
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("does not complete the milestone before the last REQUIRED checkpoint is done", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const { milestone, checkpointLessons } = await setupMilestoneWithCheckpoints(course.id, [
      { isRequired: true },
      { isRequired: true },
    ]);

    await markLessonComplete(learner.id, checkpointLessons[0].id);
    const result = await deriveBuildMilestoneCompletion(learner.id, milestone.id);

    expect(result).toBeNull();
    const rows = await db.select().from(buildProgress).where(eq(buildProgress.buildMilestoneId, milestone.id));
    expect(rows).toHaveLength(0);
  });

  it("completes the milestone exactly once the last REQUIRED checkpoint is done", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const { milestone, checkpointLessons } = await setupMilestoneWithCheckpoints(course.id, [
      { isRequired: true },
      { isRequired: true },
    ]);

    await markLessonComplete(learner.id, checkpointLessons[0].id);
    await deriveBuildMilestoneCompletion(learner.id, milestone.id);
    await markLessonComplete(learner.id, checkpointLessons[1].id);
    const result = await deriveBuildMilestoneCompletion(learner.id, milestone.id);

    expect(result?.status).toBe("COMPLETED");
    const rows = await db.select().from(buildProgress).where(eq(buildProgress.buildMilestoneId, milestone.id));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("COMPLETED");
  });

  it("an OPTIONAL checkpoint left incomplete does not block milestone completion (BLD-002)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const { milestone, checkpointLessons } = await setupMilestoneWithCheckpoints(course.id, [
      { isRequired: true },
      { isRequired: false },
    ]);

    // Only the REQUIRED checkpoint is completed; the OPTIONAL one never is.
    await markLessonComplete(learner.id, checkpointLessons[0].id);
    const result = await deriveBuildMilestoneCompletion(learner.id, milestone.id);

    expect(result?.status).toBe("COMPLETED");
  });

  it("is idempotent — calling it again after completion does not create a second row", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const { milestone, checkpointLessons } = await setupMilestoneWithCheckpoints(course.id, [{ isRequired: true }]);

    await markLessonComplete(learner.id, checkpointLessons[0].id);
    await deriveBuildMilestoneCompletion(learner.id, milestone.id);
    await deriveBuildMilestoneCompletion(learner.id, milestone.id);

    const rows = await db.select().from(buildProgress).where(eq(buildProgress.buildMilestoneId, milestone.id));
    expect(rows).toHaveLength(1);
  });

  it("returns null when the milestone has no REQUIRED checkpoint lesson associated at all", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const { milestone } = await setupMilestoneWithCheckpoints(course.id, [{ isRequired: false }]);

    const result = await deriveBuildMilestoneCompletion(learner.id, milestone.id);

    expect(result).toBeNull();
  });
});
