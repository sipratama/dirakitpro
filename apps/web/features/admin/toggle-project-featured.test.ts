import { adminAuditLogs, courses, db, enrollments, projects, type NewCourse, users } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { grantEnrollment } from "../commerce/grant-enrollment";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectNotApprovedError, ProjectNotFoundError } from "./errors";
import { toggleProjectFeatured } from "./toggle-project-featured";

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

async function insertUser(role: "LEARNER" | "ADMIN" = "LEARNER") {
  const [user] = await db
    .insert(users)
    .values({
      email: `${uniqueSlug(role.toLowerCase())}@example.com`,
      username: uniqueSlug(role.toLowerCase()),
      displayName: `Test ${role}`,
      role,
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

describe("toggleProjectFeatured", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];
  const projectIds: string[] = [];

  afterEach(async () => {
    if (projectIds.length) await db.delete(adminAuditLogs).where(inArray(adminAuditLogs.targetId, projectIds));
    if (userIds.length) await db.delete(projects).where(inArray(projects.userId, userIds));
    if (userIds.length) await db.delete(enrollments).where(inArray(enrollments.userId, userIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
    projectIds.length = 0;
  });

  it("rejects featuring a project that isn't APPROVED", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertUser("LEARNER");
    const admin = await insertUser("ADMIN");
    userIds.push(learner.id, admin.id);
    const project = await createProject(learner.id, course.id, "UNREVIEWED");
    projectIds.push(project.id);

    await expect(toggleProjectFeatured(admin.id, project.id, true)).rejects.toThrow(ProjectNotApprovedError);
  });

  it("throws for a nonexistent project id", async () => {
    const admin = await insertUser("ADMIN");
    userIds.push(admin.id);

    await expect(toggleProjectFeatured(admin.id, "00000000-0000-0000-0000-000000000000", true)).rejects.toThrow(
      ProjectNotFoundError,
    );
  });

  it("features an APPROVED project and writes exactly one audit log row", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertUser("LEARNER");
    const admin = await insertUser("ADMIN");
    userIds.push(learner.id, admin.id);
    const project = await createProject(learner.id, course.id, "APPROVED");
    projectIds.push(project.id);

    const result = await toggleProjectFeatured(admin.id, project.id, true);

    expect(result.isFeatured).toBe(true);

    const logs = await db.select().from(adminAuditLogs).where(eq(adminAuditLogs.targetId, project.id));
    expect(logs).toHaveLength(1);
    expect(logs[0]?.action).toBe("PROJECT_FEATURED");
    expect(logs[0]?.beforeData).toEqual({ isFeatured: false });
    expect(logs[0]?.afterData).toEqual({ isFeatured: true });
  });

  it("un-features a project with no APPROVED restriction and writes exactly one audit log row", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertUser("LEARNER");
    const admin = await insertUser("ADMIN");
    userIds.push(learner.id, admin.id);
    const project = await createProject(learner.id, course.id, "APPROVED");
    projectIds.push(project.id);
    await toggleProjectFeatured(admin.id, project.id, true);

    const result = await toggleProjectFeatured(admin.id, project.id, false);

    expect(result.isFeatured).toBe(false);

    const logs = await db.select().from(adminAuditLogs).where(eq(adminAuditLogs.targetId, project.id));
    expect(logs).toHaveLength(2);
    expect(logs.map((log) => log.action).sort()).toEqual(["PROJECT_FEATURED", "PROJECT_UNFEATURED"]);
  });
});
