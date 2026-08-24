import { courses, courseStages, db, lessons, type NewCourse, users } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getCourseWorkspaceOutline } from "./get-course-workspace-outline";
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

describe("getCourseWorkspaceOutline", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("returns stages/lessons in order with NOT_STARTED as the default progress status", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage One", position: 1 }).returning();
    await db.insert(lessons).values({
      courseId: course.id,
      courseStageId: stage.id,
      slug: uniqueSlug("lesson"),
      title: "Lesson A",
      type: "BUILD",
      position: 1,
      content: [],
    });

    const outline = await getCourseWorkspaceOutline(learner.id, course.id);

    expect(outline).toHaveLength(1);
    expect(outline[0]?.lessons[0]?.progressStatus).toBe("NOT_STARTED");
  });

  it("reflects COMPLETED status once the lesson has been marked complete", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const [stage] = await db.insert(courseStages).values({ courseId: course.id, title: "Stage One", position: 1 }).returning();
    const [lesson] = await db
      .insert(lessons)
      .values({
        courseId: course.id,
        courseStageId: stage.id,
        slug: uniqueSlug("lesson"),
        title: "Lesson A",
        type: "BUILD",
        position: 1,
        content: [],
      })
      .returning();

    await markLessonComplete(learner.id, lesson.id);
    const outline = await getCourseWorkspaceOutline(learner.id, course.id);

    expect(outline[0]?.lessons[0]?.progressStatus).toBe("COMPLETED");
  });

  it("returns a stage with an empty lesson list rather than omitting it", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(courseStages).values({ courseId: course.id, title: "Empty Stage", position: 1 });

    const outline = await getCourseWorkspaceOutline(learner.id, course.id);

    expect(outline).toHaveLength(1);
    expect(outline[0]?.lessons).toEqual([]);
  });
});
