import { courses, db, orderCourseGrants, orderItems, orders, type NewCourse, type NewOrder, users } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getOrderForOwner } from "./get-order-for-owner";

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
      price: "149000",
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

async function insertOrder(userId: string, courseId: string, overrides: Partial<NewOrder> = {}) {
  const [order] = await db
    .insert(orders)
    .values({
      userId,
      sourceType: "DIRECT_COURSE",
      status: "PAID",
      courseId,
      totalAmount: "149000",
      expiresAt: new Date(Date.now() + 60_000),
      ...overrides,
    })
    .returning();
  await db.insert(orderItems).values({
    orderId: order.id,
    itemType: "COURSE",
    courseId,
    itemTitle: "Test Course",
    unitPrice: "149000",
  });
  await db.insert(orderCourseGrants).values({ orderId: order.id, courseId, courseTitleSnapshot: "Test Course" });
  return order;
}

describe("getOrderForOwner", () => {
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
    }
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("returns the order with granted courses and sourceSlug for its owner", async () => {
    const course = await insertCourse({ title: "Rakit Aplikasi Keuangan Pribadi" });
    courseIds.push(course.id);
    const owner = await insertLearner();
    userIds.push(owner.id);
    const order = await insertOrder(owner.id, course.id);

    const result = await getOrderForOwner(order.id, owner.id);

    expect(result).not.toBeNull();
    expect(result?.status).toBe("PAID");
    expect(result?.grantedCourses).toEqual([{ courseId: course.id, title: "Test Course" }]);
    expect(result?.sourceSlug).toBe(course.slug);
  });

  it("returns null when the order belongs to a different user, without distinguishing from not-found", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const owner = await insertLearner();
    const stranger = await insertLearner();
    userIds.push(owner.id, stranger.id);
    const order = await insertOrder(owner.id, course.id);

    const result = await getOrderForOwner(order.id, stranger.id);

    expect(result).toBeNull();
  });

  it("returns null for a nonexistent order id", async () => {
    const learner = await insertLearner();
    userIds.push(learner.id);

    const result = await getOrderForOwner("00000000-0000-0000-0000-000000000000", learner.id);

    expect(result).toBeNull();
  });

  it("returns null (not a DB error) for a malformed orderId that isn't a valid UUID", async () => {
    const learner = await insertLearner();
    userIds.push(learner.id);

    const result = await getOrderForOwner("not-a-uuid-at-all", learner.id);

    expect(result).toBeNull();
  });
});
