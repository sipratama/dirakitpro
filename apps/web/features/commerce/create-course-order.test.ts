import {
  courses,
  db,
  enrollments,
  orderCourseGrants,
  orderItems,
  orders,
  projects,
  type NewCourse,
  users,
} from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createCourseOrder } from "./create-course-order";
import { AlreadyOwnedError, CourseNotPurchasableError } from "./errors";

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

describe("createCourseOrder", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (userIds.length) {
      const userOrders = await db.select({ id: orders.id }).from(orders).where(inArray(orders.userId, userIds));
      const orderIds = userOrders.map((o) => o.id);
      if (orderIds.length) {
        await db.delete(orderCourseGrants).where(inArray(orderCourseGrants.orderId, orderIds));
        await db.delete(orderItems).where(inArray(orderItems.orderId, orderIds));
      }
      await db.delete(orders).where(inArray(orders.userId, userIds));
      await db.delete(projects).where(inArray(projects.userId, userIds));
      await db.delete(enrollments).where(inArray(enrollments.userId, userIds));
    }
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("rejects a nonexistent/unpublished course slug before creating any Order", async () => {
    const learner = await insertLearner();
    userIds.push(learner.id);
    const draftCourse = await insertCourse({ status: "DRAFT" });
    courseIds.push(draftCourse.id);

    await expect(createCourseOrder(learner.id, "does-not-exist")).rejects.toThrow(CourseNotPurchasableError);
    await expect(createCourseOrder(learner.id, draftCourse.slug)).rejects.toThrow(CourseNotPurchasableError);

    const orderRows = await db.select().from(orders).where(eq(orders.userId, learner.id));
    expect(orderRows).toHaveLength(0);
  });

  it("blocks purchase of an already-owned course before creating any Order (COM-016)", async () => {
    const course = await insertCourse({ price: "149000" });
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(enrollments).values({ userId: learner.id, courseId: course.id, status: "ACTIVE" });

    await expect(createCourseOrder(learner.id, course.slug)).rejects.toThrow(AlreadyOwnedError);

    const orderRows = await db.select().from(orders).where(eq(orders.userId, learner.id));
    expect(orderRows).toHaveLength(0);
  });

  it("activates an ACTIVE enrollment directly for a FREE course, without creating an Order/Payment (10.4)", async () => {
    const course = await insertCourse({ price: "0" });
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const result = await createCourseOrder(learner.id, course.slug);

    expect(result).toEqual({ kind: "free_enrolled", courseSlug: course.slug });

    const enrollmentRows = await db.select().from(enrollments).where(eq(enrollments.userId, learner.id));
    expect(enrollmentRows).toHaveLength(1);
    expect(enrollmentRows[0]?.status).toBe("ACTIVE");

    const orderRows = await db.select().from(orders).where(eq(orders.userId, learner.id));
    expect(orderRows).toHaveLength(0);
  });

  it("creates a PENDING Order with an OrderItem snapshot and a single-course OrderCourseGrant for a paid course (COM-002/COM-008)", async () => {
    const course = await insertCourse({ price: "149000", title: "Rakit Aplikasi Keuangan Pribadi" });
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const result = await createCourseOrder(learner.id, course.slug);

    expect(result.kind).toBe("order_created");
    if (result.kind !== "order_created") throw new Error("unreachable");
    expect(result.order.status).toBe("PENDING");
    expect(result.order.totalAmount).toBe("149000.00");

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, result.order.id));
    expect(items).toHaveLength(1);
    expect(items[0]?.itemTitle).toBe("Rakit Aplikasi Keuangan Pribadi");
    expect(items[0]?.unitPrice).toBe("149000.00");

    const grants = await db.select().from(orderCourseGrants).where(eq(orderCourseGrants.orderId, result.order.id));
    expect(grants).toHaveLength(1);
    expect(grants[0]?.courseId).toBe(course.id);
  });

  it("reuses an existing non-expired PENDING Order for the same user+course instead of creating a duplicate (COM-015)", async () => {
    const course = await insertCourse({ price: "149000" });
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const first = await createCourseOrder(learner.id, course.slug);
    const second = await createCourseOrder(learner.id, course.slug);

    expect(first.kind).toBe("order_created");
    expect(second.kind).toBe("order_reused");
    if (first.kind !== "order_created" || second.kind !== "order_reused") throw new Error("unreachable");
    expect(second.order.id).toBe(first.order.id);

    const orderRows = await db.select().from(orders).where(eq(orders.userId, learner.id));
    expect(orderRows).toHaveLength(1);
  });

  it("never creates two simultaneous PENDING orders for the same user+course under a concurrent race (COM-015)", async () => {
    const course = await insertCourse({ price: "149000" });
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const [a, b] = await Promise.all([createCourseOrder(learner.id, course.slug), createCourseOrder(learner.id, course.slug)]);

    const orderIdOf = (result: Awaited<ReturnType<typeof createCourseOrder>>) =>
      result.kind === "order_created" || result.kind === "order_reused" ? result.order.id : null;
    expect(orderIdOf(a)).toBe(orderIdOf(b));

    const orderRows = await db.select().from(orders).where(eq(orders.userId, learner.id));
    expect(orderRows).toHaveLength(1);
  });
});
