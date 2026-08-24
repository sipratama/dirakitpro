import {
  buildMilestones,
  buildProgress,
  courses,
  courseStages,
  db,
  enrollments,
  lessons,
  type NewCourse,
  users,
} from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getDashboardCourses } from "./get-dashboard-courses";

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

describe("getDashboardCourses", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (userIds.length) await db.delete(enrollments).where(inArray(enrollments.userId, userIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("returns an empty list when the learner has no enrollment", async () => {
    const learner = await insertLearner();
    userIds.push(learner.id);

    expect(await getDashboardCourses(learner.id)).toEqual([]);
  });

  it("returns Build Progress, the resume lesson's stage name, and its slug for an enrolled course", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(enrollments).values({ userId: learner.id, courseId: course.id, status: "ACTIVE" });

    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Make It Visible", position: 1 }).returning();
    await db.insert(lessons).values({
      courseId: course.id,
      courseStageId: stage.id,
      slug: "first-lesson",
      title: "First lesson",
      type: "BUILD",
      position: 1,
      content: [],
    });
    const [milestone] = await db
      .insert(buildMilestones)
      .values({ courseId: course.id, title: "Shell", position: 1, isRequired: true })
      .returning();
    await db.insert(buildProgress).values({ userId: learner.id, buildMilestoneId: milestone.id, status: "COMPLETED" });

    const [dashboardCourse] = await getDashboardCourses(learner.id);

    expect(dashboardCourse?.courseSlug).toBe(course.slug);
    expect(dashboardCourse?.buildProgress).toEqual({ completedCount: 1, totalRequired: 1, ratio: 1 });
    expect(dashboardCourse?.currentStageName).toBe("Make It Visible");
    expect(dashboardCourse?.resumeLessonSlug).toBe("first-lesson");
  });

  it("does not include a REVOKED enrollment's course", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(enrollments).values({ userId: learner.id, courseId: course.id, status: "REVOKED" });

    expect(await getDashboardCourses(learner.id)).toEqual([]);
  });
});
