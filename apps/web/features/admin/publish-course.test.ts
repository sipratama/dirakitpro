import { adminAuditLogs, courses, db, users, type NewCourse } from "@dirakitpro/database";
import { and, eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { CoursePriceInvalidError } from "./errors";
import { publishCourse } from "./publish-course";

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
      price: "0",
      status: "DRAFT",
      ...overrides,
    })
    .returning();
  return course;
}

async function insertAdmin() {
  const [admin] = await db
    .insert(users)
    .values({
      email: `${uniqueSlug("admin")}@example.com`,
      username: uniqueSlug("admin"),
      displayName: "Test Admin",
      role: "ADMIN",
    })
    .returning();
  return admin;
}

describe("publishCourse", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(adminAuditLogs).where(and(eq(adminAuditLogs.targetType, "course"), inArray(adminAuditLogs.targetId, courseIds)));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("always allows publishing a FREE course (price = 0)", async () => {
    const course = await insertCourse({ price: "0" });
    courseIds.push(course.id);
    const admin = await insertAdmin();
    userIds.push(admin.id);

    const published = await publishCourse(course.id, admin.id);
    expect(published.status).toBe("PUBLISHED");
    expect(published.publishedAt).not.toBeNull();
  });

  it("allows publishing a paid course with a valid price > 0", async () => {
    const course = await insertCourse({ price: "149000" });
    courseIds.push(course.id);
    const admin = await insertAdmin();
    userIds.push(admin.id);

    const published = await publishCourse(course.id, admin.id);
    expect(published.status).toBe("PUBLISHED");
  });

  it("rejects publishing a course whose stored price is negative (COM-001)", async () => {
    const course = await insertCourse({ price: "-1" });
    courseIds.push(course.id);
    const admin = await insertAdmin();
    userIds.push(admin.id);

    await expect(publishCourse(course.id, admin.id)).rejects.toThrow(CoursePriceInvalidError);
  });

  it("is idempotent about publishedAt on re-publish", async () => {
    const course = await insertCourse({ price: "0" });
    courseIds.push(course.id);
    const admin = await insertAdmin();
    userIds.push(admin.id);

    const first = await publishCourse(course.id, admin.id);
    await db.update(courses).set({ status: "UNPUBLISHED" }).where(inArray(courses.id, [course.id]));
    const second = await publishCourse(course.id, admin.id);

    expect(second.publishedAt?.getTime()).toBe(first.publishedAt?.getTime());
  });

  it("writes exactly one audit log row with the correct before/after snapshot, including price", async () => {
    const course = await insertCourse({ price: "149000" });
    courseIds.push(course.id);
    const admin = await insertAdmin();
    userIds.push(admin.id);

    await publishCourse(course.id, admin.id);

    const logs = await db.select().from(adminAuditLogs).where(eq(adminAuditLogs.targetId, course.id));
    expect(logs).toHaveLength(1);
    expect(logs[0]?.action).toBe("COURSE_PUBLISHED");
    expect(logs[0]?.adminUserId).toBe(admin.id);
    expect(logs[0]?.targetType).toBe("course");
    expect(logs[0]?.beforeData).toEqual({ status: "DRAFT" });
    expect(logs[0]?.afterData).toEqual({ status: "PUBLISHED", price: "149000.00" });
  });
});
