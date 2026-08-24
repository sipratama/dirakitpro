import { courses, courseStages, db, lessons, type NewCourse, users } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getResumeLesson } from "./get-resume-lesson";
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

async function insertOrderedLessons(courseId: string, titles: string[]) {
  const [stageOne] = await db.insert(courseStages).values({ courseId, title: "Stage 1", position: 1 }).returning();
  const [stageTwo] = await db.insert(courseStages).values({ courseId, title: "Stage 2", position: 2 }).returning();
  const stages = [stageOne, stageOne, stageTwo]; // first two lessons in stage 1, third in stage 2 — caller passes exactly 3 titles

  return db
    .insert(lessons)
    .values(
      titles.map((title, index) => ({
        courseId,
        courseStageId: stages[index]!.id,
        slug: uniqueSlug("lesson"),
        title,
        type: "BUILD" as const,
        position: index === 2 ? 1 : index + 1,
        content: [],
      })),
    )
    .returning();
}

describe("getResumeLesson", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds)); // cascades stages/lessons/progress
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("returns null when the course has no lessons", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    expect(await getResumeLesson(learner.id, course.id)).toBeNull();
  });

  it("returns the first lesson (stage/position order) when nothing is completed yet", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const [lessonOne] = await insertOrderedLessons(course.id, ["Lesson 1", "Lesson 2", "Lesson 3"]);

    const resume = await getResumeLesson(learner.id, course.id);
    expect(resume?.id).toBe(lessonOne.id);
  });

  it("skips completed lessons and returns the first one still incomplete", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const [lessonOne, lessonTwo] = await insertOrderedLessons(course.id, ["Lesson 1", "Lesson 2", "Lesson 3"]);

    await markLessonComplete(learner.id, lessonOne.id);

    const resume = await getResumeLesson(learner.id, course.id);
    expect(resume?.id).toBe(lessonTwo.id);
  });

  it("returns the last lesson once every lesson is COMPLETED", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const [lessonOne, lessonTwo, lessonThree] = await insertOrderedLessons(course.id, [
      "Lesson 1",
      "Lesson 2",
      "Lesson 3",
    ]);

    await markLessonComplete(learner.id, lessonOne.id);
    await markLessonComplete(learner.id, lessonTwo.id);
    await markLessonComplete(learner.id, lessonThree.id);

    const resume = await getResumeLesson(learner.id, course.id);
    expect(resume?.id).toBe(lessonThree.id);
  });
});
