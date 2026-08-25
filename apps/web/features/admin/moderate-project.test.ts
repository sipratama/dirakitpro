import { adminAuditLogs, courses, db, enrollments, projects, type NewCourse, users } from "@dirakitpro/database";
import { and, eq, inArray } from "drizzle-orm";
import { grantEnrollment } from "../commerce/grant-enrollment";
import { afterEach, describe, expect, it } from "vitest";
import { ModerationReasonRequiredError, ProjectNotFoundError } from "./errors";
import { moderateProject } from "./moderate-project";

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

async function createProject(learnerId: string, courseId: string, moderationStatus: "UNREVIEWED" | "APPROVED" | "REJECTED" | "HIDDEN" = "UNREVIEWED") {
  await grantEnrollment(learnerId, courseId);
  const [project] = await db.select().from(projects).where(eq(projects.userId, learnerId));
  const [updated] = await db.update(projects).set({ moderationStatus }).where(eq(projects.id, project.id)).returning();
  return updated;
}

describe("moderateProject", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];
  const projectIds: string[] = [];

  afterEach(async () => {
    if (projectIds.length) await db.delete(adminAuditLogs).where(and(eq(adminAuditLogs.targetType, "project"), inArray(adminAuditLogs.targetId, projectIds)));
    if (userIds.length) await db.delete(projects).where(inArray(projects.userId, userIds));
    if (userIds.length) await db.delete(enrollments).where(inArray(enrollments.userId, userIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
    projectIds.length = 0;
  });

  it("rejects REJECT without a reason at the function level", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertUser("LEARNER");
    const admin = await insertUser("ADMIN");
    userIds.push(learner.id, admin.id);
    const project = await createProject(learner.id, course.id);
    projectIds.push(project.id);

    await expect(moderateProject(admin.id, project.id, "REJECT")).rejects.toThrow(ModerationReasonRequiredError);
    await expect(moderateProject(admin.id, project.id, "REJECT", "   ")).rejects.toThrow(ModerationReasonRequiredError);
  });

  it("rejects HIDE without a reason at the function level", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertUser("LEARNER");
    const admin = await insertUser("ADMIN");
    userIds.push(learner.id, admin.id);
    const project = await createProject(learner.id, course.id, "APPROVED");
    projectIds.push(project.id);

    await expect(moderateProject(admin.id, project.id, "HIDE")).rejects.toThrow(ModerationReasonRequiredError);
  });

  it("throws for a nonexistent project id", async () => {
    const admin = await insertUser("ADMIN");
    userIds.push(admin.id);

    await expect(moderateProject(admin.id, "00000000-0000-0000-0000-000000000000", "APPROVE")).rejects.toThrow(
      ProjectNotFoundError,
    );
  });

  it("APPROVE writes exactly one audit log row with the correct before/after snapshot, no reason required", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertUser("LEARNER");
    const admin = await insertUser("ADMIN");
    userIds.push(learner.id, admin.id);
    const project = await createProject(learner.id, course.id, "UNREVIEWED");
    projectIds.push(project.id);

    const result = await moderateProject(admin.id, project.id, "APPROVE");

    expect(result.moderationStatus).toBe("APPROVED");

    const logs = await db.select().from(adminAuditLogs).where(eq(adminAuditLogs.targetId, project.id));
    expect(logs).toHaveLength(1);
    expect(logs[0]?.action).toBe("PROJECT_APPROVED");
    expect(logs[0]?.adminUserId).toBe(admin.id);
    expect(logs[0]?.targetType).toBe("project");
    expect(logs[0]?.beforeData).toEqual({ moderationStatus: "UNREVIEWED" });
    expect(logs[0]?.afterData).toEqual({ moderationStatus: "APPROVED" });
  });

  it("REJECT with a reason writes exactly one audit log row and stores the reason on the project", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertUser("LEARNER");
    const admin = await insertUser("ADMIN");
    userIds.push(learner.id, admin.id);
    const project = await createProject(learner.id, course.id, "UNREVIEWED");
    projectIds.push(project.id);

    const result = await moderateProject(admin.id, project.id, "REJECT", "Live URL tidak bisa diakses");

    expect(result.moderationStatus).toBe("REJECTED");
    expect(result.moderationReason).toBe("Live URL tidak bisa diakses");

    const logs = await db.select().from(adminAuditLogs).where(eq(adminAuditLogs.targetId, project.id));
    expect(logs).toHaveLength(1);
    expect(logs[0]?.action).toBe("PROJECT_REJECTED");
    expect(logs[0]?.reason).toBe("Live URL tidak bisa diakses");
    expect(logs[0]?.beforeData).toEqual({ moderationStatus: "UNREVIEWED" });
    expect(logs[0]?.afterData).toEqual({ moderationStatus: "REJECTED" });
  });

  it("HIDE with a reason writes exactly one audit log row", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertUser("LEARNER");
    const admin = await insertUser("ADMIN");
    userIds.push(learner.id, admin.id);
    const project = await createProject(learner.id, course.id, "APPROVED");
    projectIds.push(project.id);

    const result = await moderateProject(admin.id, project.id, "HIDE", "Konten melanggar kebijakan");

    expect(result.moderationStatus).toBe("HIDDEN");

    const logs = await db.select().from(adminAuditLogs).where(eq(adminAuditLogs.targetId, project.id));
    expect(logs).toHaveLength(1);
    expect(logs[0]?.action).toBe("PROJECT_HIDDEN");
    expect(logs[0]?.beforeData).toEqual({ moderationStatus: "APPROVED" });
    expect(logs[0]?.afterData).toEqual({ moderationStatus: "HIDDEN" });
  });

  it("allows moving from REJECTED back to APPROVED (reconsider) and clears the old reason", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertUser("LEARNER");
    const admin = await insertUser("ADMIN");
    userIds.push(learner.id, admin.id);
    const project = await createProject(learner.id, course.id, "UNREVIEWED");
    projectIds.push(project.id);
    await moderateProject(admin.id, project.id, "REJECT", "Awalnya ditolak");

    const result = await moderateProject(admin.id, project.id, "APPROVE");

    expect(result.moderationStatus).toBe("APPROVED");
    expect(result.moderationReason).toBeNull();

    const logs = await db.select().from(adminAuditLogs).where(eq(adminAuditLogs.targetId, project.id));
    expect(logs).toHaveLength(2);
    expect(logs.map((log) => log.action).sort()).toEqual(["PROJECT_APPROVED", "PROJECT_REJECTED"]);
  });
});
