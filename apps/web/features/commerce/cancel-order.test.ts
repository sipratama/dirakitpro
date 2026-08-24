import { courses, db, orders, type NewCourse, type NewOrder, users } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { cancelOrder } from "./cancel-order";
import { OrderNotCancellableError, OrderOwnershipError } from "./errors";

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
      status: "PENDING",
      courseId,
      totalAmount: "149000",
      expiresAt: new Date(Date.now() + 60_000),
      ...overrides,
    })
    .returning();
  return order;
}

describe("cancelOrder", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (userIds.length) await db.delete(orders).where(inArray(orders.userId, userIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("transitions a PENDING order owned by the caller to CANCELLED (10.1)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertOrder(learner.id, course.id);

    const cancelled = await cancelOrder(order.id, learner.id);

    expect(cancelled.status).toBe("CANCELLED");
    expect(cancelled.cancelledAt).not.toBeNull();

    const [row] = await db.select().from(orders).where(eq(orders.id, order.id));
    expect(row?.status).toBe("CANCELLED");
  });

  it("rejects cancellation by a user who does not own the order, without revealing whether it exists", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const owner = await insertLearner();
    const stranger = await insertLearner();
    userIds.push(owner.id, stranger.id);
    const order = await insertOrder(owner.id, course.id);

    await expect(cancelOrder(order.id, stranger.id)).rejects.toThrow(OrderOwnershipError);

    const [row] = await db.select().from(orders).where(eq(orders.id, order.id));
    expect(row?.status).toBe("PENDING");
  });

  it("rejects cancelling an order that is no longer PENDING", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertOrder(learner.id, course.id, { status: "PAID", paidAt: new Date() });

    await expect(cancelOrder(order.id, learner.id)).rejects.toThrow(OrderNotCancellableError);
  });
});
