import { courses, db, orderCourseGrants, orderItems, orders, type NewCourse, type NewOrder, users } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getOrdersForUser } from "./get-orders-for-user";

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
    itemTitle: "Snapshot Title",
    unitPrice: "149000",
  });
  await db.insert(orderCourseGrants).values({ orderId: order.id, courseId, courseTitleSnapshot: "Snapshot Title" });
  return order;
}

describe("getOrdersForUser", () => {
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

  it("returns an empty list for a learner with no orders", async () => {
    const learner = await insertLearner();
    userIds.push(learner.id);

    expect(await getOrdersForUser(learner.id)).toEqual([]);
  });

  it("returns the learner's own orders with itemTitle/status/amount/grantedCourseTitles from the immutable snapshot", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertOrder(learner.id, course.id);

    const result = await getOrdersForUser(learner.id);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(order.id);
    expect(result[0]?.itemTitle).toBe("Snapshot Title");
    expect(result[0]?.status).toBe("PAID");
    expect(result[0]?.totalAmount).toBe("149000.00");
    expect(result[0]?.grantedCourseTitles).toEqual(["Snapshot Title"]);
  });

  it("does not include another learner's orders", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const owner = await insertLearner();
    const stranger = await insertLearner();
    userIds.push(owner.id, stranger.id);
    await insertOrder(owner.id, course.id);

    expect(await getOrdersForUser(stranger.id)).toEqual([]);
  });
});
