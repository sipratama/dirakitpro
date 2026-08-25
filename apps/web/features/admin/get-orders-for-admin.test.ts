import { courses, db, orderItems, orders, type NewCourse, type NewOrder, users } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getOrdersForAdmin } from "./get-orders-for-admin";

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

async function insertDirectCourseOrder(userId: string, courseId: string, overrides: Partial<NewOrder> = {}) {
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
    itemTitle: "Rakit Aplikasi Keuangan Pribadi",
    unitPrice: "149000",
  });
  return order;
}

describe("getOrdersForAdmin", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];
  const orderIds: string[] = [];

  afterEach(async () => {
    if (orderIds.length) {
      await db.delete(orderItems).where(inArray(orderItems.orderId, orderIds));
      await db.delete(orders).where(inArray(orders.id, orderIds));
    }
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
    orderIds.length = 0;
  });

  // Finds the specific order this test created rather than asserting the
  // full list/length — orders is global and other test files run
  // concurrently against the same dev DB.
  it("includes the order's user email, item title (from the OrderItem snapshot), amount, and status", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertDirectCourseOrder(learner.id, course.id);
    orderIds.push(order.id);

    const result = await getOrdersForAdmin();
    const row = result.find((o) => o.id === order.id);

    expect(row?.userEmail).toBe(learner.email);
    expect(row?.itemTitle).toBe("Rakit Aplikasi Keuangan Pribadi");
    expect(row?.totalAmount).toBe("149000.00");
    expect(row?.status).toBe("PAID");
  });

  it("still shows the OrderItem's snapshotted title even if the course title changes afterwards", async () => {
    const course = await insertCourse({ title: "Original Title" });
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertDirectCourseOrder(learner.id, course.id);
    orderIds.push(order.id);
    await db.update(courses).set({ title: "Renamed Title" }).where(inArray(courses.id, [course.id]));

    const result = await getOrdersForAdmin();
    const row = result.find((o) => o.id === order.id);

    expect(row?.itemTitle).toBe("Rakit Aplikasi Keuangan Pribadi");
  });
});
