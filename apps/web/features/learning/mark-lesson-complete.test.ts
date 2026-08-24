import { courses, courseStages, db, lessonProgress, lessons, type NewCourse, users } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
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

async function insertLesson(courseId: string) {
  const [stage] = await db.insert(courseStages).values({ courseId, title: "Stage", position: 1 }).returning();
  const [lesson] = await db
    .insert(lessons)
    .values({
      courseId,
      courseStageId: stage.id,
      slug: uniqueSlug("lesson"),
      title: "Lesson",
      type: "BUILD",
      position: 1,
      content: [],
    })
    .returning();
  return lesson;
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

describe("markLessonComplete", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds)); // cascades stages/lessons/progress
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("creates a COMPLETED LessonProgress row with timestamps when none existed", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const lesson = await insertLesson(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const progress = await markLessonComplete(learner.id, lesson.id);

    expect(progress.status).toBe("COMPLETED");
    expect(progress.completedAt).not.toBeNull();
    expect(progress.startedAt).not.toBeNull();
  });

  it("stays idempotent on a repeat call — same row, first completedAt preserved", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const lesson = await insertLesson(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const first = await markLessonComplete(learner.id, lesson.id);
    const second = await markLessonComplete(learner.id, lesson.id);

    expect(second.id).toBe(first.id);
    expect(second.completedAt?.getTime()).toBe(first.completedAt?.getTime());

    const rows = await db.select().from(lessonProgress).where(eq(lessonProgress.lessonId, lesson.id));
    expect(rows).toHaveLength(1);
  });

  it("does not create a duplicate row when two calls race on the same lesson (Promise.all)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const lesson = await insertLesson(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const [a, b] = await Promise.all([
      markLessonComplete(learner.id, lesson.id),
      markLessonComplete(learner.id, lesson.id),
    ]);

    expect(a.id).toBe(b.id);

    const rows = await db.select().from(lessonProgress).where(eq(lessonProgress.lessonId, lesson.id));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("COMPLETED");
  });
});
