import { courses, db, enrollments, projects, type NewCourse, users } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { grantEnrollment } from "../commerce/grant-enrollment";
import { afterEach, describe, expect, it } from "vitest";
import { getCuratedGallery } from "./get-curated-gallery";

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

async function createProject(
  learnerId: string,
  courseId: string,
  overrides: { visibility: "PRIVATE" | "PUBLIC"; moderationStatus: "UNREVIEWED" | "APPROVED" | "REJECTED" | "HIDDEN"; isFeatured: boolean },
) {
  await grantEnrollment(learnerId, courseId);
  const [project] = await db.select().from(projects).where(eq(projects.userId, learnerId));
  const [updated] = await db.update(projects).set(overrides).where(eq(projects.id, project.id)).returning();
  return updated;
}

describe("getCuratedGallery", () => {
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

  it("returns empty with no fallback when nothing is PUBLIC + APPROVED + FEATURED yet", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await createProject(learner.id, course.id, { visibility: "PUBLIC", moderationStatus: "APPROVED", isFeatured: false });

    const result = await getCuratedGallery();

    expect(result).toHaveLength(0);
  });

  it("excludes PUBLIC + FEATURED that isn't APPROVED", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await createProject(learner.id, course.id, { visibility: "PUBLIC", moderationStatus: "UNREVIEWED", isFeatured: true });

    const result = await getCuratedGallery();

    expect(result).toHaveLength(0);
  });

  it("excludes APPROVED + FEATURED that isn't PUBLIC", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await createProject(learner.id, course.id, { visibility: "PRIVATE", moderationStatus: "APPROVED", isFeatured: true });

    const result = await getCuratedGallery();

    expect(result).toHaveLength(0);
  });

  it("includes exactly the projects that are PUBLIC + APPROVED + FEATURED", async () => {
    const courseA = await insertCourse();
    const courseB = await insertCourse();
    courseIds.push(courseA.id, courseB.id);
    const featured = await insertLearner();
    const notFeatured = await insertLearner();
    userIds.push(featured.id, notFeatured.id);

    const qualifying = await createProject(featured.id, courseA.id, {
      visibility: "PUBLIC",
      moderationStatus: "APPROVED",
      isFeatured: true,
    });
    await createProject(notFeatured.id, courseB.id, { visibility: "PUBLIC", moderationStatus: "APPROVED", isFeatured: false });

    const result = await getCuratedGallery();

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(qualifying.id);
    expect(result[0]?.authorUsername).toBe(featured.username);
  });
});
