import { courses, db, enrollments, projects, type NewCourse, users } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { grantEnrollment } from "../commerce/grant-enrollment";
import { afterEach, describe, expect, it } from "vitest";
import { getProjectsForModeration } from "./get-projects-for-moderation";

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

async function createProject(learnerId: string, courseId: string, moderationStatus: "UNREVIEWED" | "APPROVED" | "REJECTED" | "HIDDEN") {
  await grantEnrollment(learnerId, courseId);
  const [project] = await db.select().from(projects).where(eq(projects.userId, learnerId));
  const [updated] = await db.update(projects).set({ moderationStatus }).where(eq(projects.id, project.id)).returning();
  return updated;
}

describe("getProjectsForModeration", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (userIds.length) await db.delete(projects).where(inArray(projects.userId, userIds));
    if (userIds.length) await db.delete(enrollments).where(inArray(enrollments.userId, userIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("defaults to UNREVIEWED when no filter is given, including learner name and course title", async () => {
    const course = await insertCourse({ title: "Rakitan Pertama" });
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const project = await createProject(learner.id, course.id, "UNREVIEWED");

    const result = await getProjectsForModeration();
    const row = result.find((p) => p.id === project.id);

    expect(row).toBeDefined();
    expect(row?.learnerDisplayName).toBe(learner.displayName);
    expect(row?.courseTitle).toBe("Rakitan Pertama");
  });

  it("excludes a non-matching status when an explicit filter is given", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const project = await createProject(learner.id, course.id, "APPROVED");

    const unreviewedOnly = await getProjectsForModeration("UNREVIEWED");
    const approvedOnly = await getProjectsForModeration("APPROVED");

    expect(unreviewedOnly.some((p) => p.id === project.id)).toBe(false);
    expect(approvedOnly.some((p) => p.id === project.id)).toBe(true);
  });

  it("returns every status when explicitly passed null (the 'lihat semua' toggle)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const project = await createProject(learner.id, course.id, "HIDDEN");

    const all = await getProjectsForModeration(null);

    expect(all.some((p) => p.id === project.id)).toBe(true);
  });
});
