import { courses, db, enrollments, projects, type NewCourse, users } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { grantEnrollment } from "../commerce/grant-enrollment";
import { afterEach, describe, expect, it } from "vitest";
import { getPublicProject } from "./get-public-project";

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

type Visibility = "PRIVATE" | "PUBLIC";
type ModerationStatus = "UNREVIEWED" | "APPROVED" | "REJECTED" | "HIDDEN";

async function createProject(learnerId: string, courseId: string, visibility: Visibility, moderationStatus: ModerationStatus) {
  await grantEnrollment(learnerId, courseId);
  const [project] = await db.select().from(projects).where(eq(projects.userId, learnerId));
  const [updated] = await db.update(projects).set({ visibility, moderationStatus }).where(eq(projects.id, project.id)).returning();
  return updated;
}

describe("getPublicProject", () => {
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

  it("returns null for a nonexistent username", async () => {
    const result = await getPublicProject("no-such-user", "no-such-slug");
    expect(result).toBeNull();
  });

  it("returns null for a nonexistent slug under an existing user", async () => {
    const learner = await insertLearner();
    userIds.push(learner.id);

    const result = await getPublicProject(learner.username, "no-such-slug");
    expect(result).toBeNull();
  });

  const cases: { visibility: Visibility; moderationStatus: ModerationStatus; expectVisible: boolean; expectIndexable?: boolean }[] = [
    { visibility: "PRIVATE", moderationStatus: "UNREVIEWED", expectVisible: false },
    { visibility: "PRIVATE", moderationStatus: "APPROVED", expectVisible: false },
    { visibility: "PRIVATE", moderationStatus: "REJECTED", expectVisible: false },
    { visibility: "PRIVATE", moderationStatus: "HIDDEN", expectVisible: false },
    { visibility: "PUBLIC", moderationStatus: "UNREVIEWED", expectVisible: true, expectIndexable: false },
    { visibility: "PUBLIC", moderationStatus: "APPROVED", expectVisible: true, expectIndexable: true },
    { visibility: "PUBLIC", moderationStatus: "REJECTED", expectVisible: false },
    { visibility: "PUBLIC", moderationStatus: "HIDDEN", expectVisible: false },
  ];

  for (const { visibility, moderationStatus, expectVisible, expectIndexable } of cases) {
    it(`${visibility} + ${moderationStatus} -> ${expectVisible ? `visible (indexable=${expectIndexable})` : "null"}`, async () => {
      const course = await insertCourse();
      courseIds.push(course.id);
      const learner = await insertLearner();
      userIds.push(learner.id);
      const project = await createProject(learner.id, course.id, visibility, moderationStatus);

      const result = await getPublicProject(learner.username, project.slug);

      if (!expectVisible) {
        expect(result).toBeNull();
      } else {
        expect(result?.id).toBe(project.id);
        expect(result?.indexable).toBe(expectIndexable);
        expect(result?.authorUsername).toBe(learner.username);
        expect(result?.courseTitle).toBe("Test Course");
      }
    });
  }

  it("returns null for the owner viewing their own PRIVATE project through this route", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const project = await createProject(learner.id, course.id, "PRIVATE", "UNREVIEWED");

    const result = await getPublicProject(learner.username, project.slug);

    expect(result).toBeNull();
  });
});
