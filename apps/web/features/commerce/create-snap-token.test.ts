import {
  courses,
  db,
  orderItems,
  orders,
  payments,
  type NewCourse,
  type NewOrder,
  users,
} from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OrderNotPayableError } from "./errors";

const mockCreateTransaction = vi.fn();

vi.mock("midtrans-client", () => ({
  default: {
    Snap: vi.fn().mockImplementation(function FakeSnap() {
      return { createTransaction: mockCreateTransaction };
    }),
  },
}));

const { createSnapToken } = await import("./create-snap-token");

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

async function insertOrderWithItem(userId: string, courseId: string, overrides: Partial<NewOrder> = {}) {
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
  await db.insert(orderItems).values({
    orderId: order.id,
    itemType: "COURSE",
    courseId,
    itemTitle: "Test Course",
    unitPrice: "149000",
  });
  return order;
}

describe("createSnapToken", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];
  const originalServerKey = process.env.MIDTRANS_SERVER_KEY;
  const originalClientKey = process.env.MIDTRANS_CLIENT_KEY;

  beforeEach(() => {
    mockCreateTransaction.mockReset();
    mockCreateTransaction.mockResolvedValue({ token: "fake-snap-token", redirect_url: "https://example.com/snap" });
    process.env.MIDTRANS_SERVER_KEY = "SB-Mid-server-fake";
    process.env.MIDTRANS_CLIENT_KEY = "SB-Mid-client-fake";
  });

  afterEach(async () => {
    if (userIds.length) {
      const userOrders = await db.select({ id: orders.id }).from(orders).where(inArray(orders.userId, userIds));
      const orderIds = userOrders.map((o) => o.id);
      if (orderIds.length) {
        await db.delete(payments).where(inArray(payments.orderId, orderIds));
        await db.delete(orderItems).where(inArray(orderItems.orderId, orderIds));
      }
      await db.delete(orders).where(inArray(orders.userId, userIds));
    }
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;

    process.env.MIDTRANS_SERVER_KEY = originalServerKey;
    process.env.MIDTRANS_CLIENT_KEY = originalClientKey;
  });

  it("rejects a nonexistent order id", async () => {
    await expect(createSnapToken("00000000-0000-0000-0000-000000000000")).rejects.toThrow(OrderNotPayableError);
    expect(mockCreateTransaction).not.toHaveBeenCalled();
  });

  it("rejects an order that is no longer PENDING", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertOrderWithItem(learner.id, course.id, { status: "PAID", paidAt: new Date() });

    await expect(createSnapToken(order.id)).rejects.toThrow(OrderNotPayableError);
    expect(mockCreateTransaction).not.toHaveBeenCalled();
  });

  it("rejects an order whose own expiresAt has already passed", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertOrderWithItem(learner.id, course.id, { expiresAt: new Date(Date.now() - 1000) });

    await expect(createSnapToken(order.id)).rejects.toThrow(OrderNotPayableError);
    expect(mockCreateTransaction).not.toHaveBeenCalled();
  });

  it("requests a Snap transaction with the order's snapshot amount and creates a PENDING Payment row without a providerTransactionId yet", async () => {
    const course = await insertCourse({ price: "149000" });
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertOrderWithItem(learner.id, course.id, { totalAmount: "149000" });

    const token = await createSnapToken(order.id);

    expect(token).toBe("fake-snap-token");
    expect(mockCreateTransaction).toHaveBeenCalledTimes(1);
    const [parameter] = mockCreateTransaction.mock.calls[0]!;
    expect(parameter.transaction_details).toEqual({ order_id: order.id, gross_amount: 149000 });
    expect(parameter.customer_details.email).toBe(learner.email);

    const [payment] = await db.select().from(payments).where(eq(payments.orderId, order.id));
    expect(payment?.provider).toBe("MIDTRANS");
    expect(payment?.normalizedStatus).toBe("PENDING");
    expect(payment?.providerTransactionId).toBeNull();
  });

  it("requests a brand-new token on every call, without creating a second Payment row", async () => {
    const course = await insertCourse({ price: "149000" });
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertOrderWithItem(learner.id, course.id, { totalAmount: "149000" });

    await createSnapToken(order.id);
    await createSnapToken(order.id);

    expect(mockCreateTransaction).toHaveBeenCalledTimes(2);
    const paymentRows = await db.select().from(payments).where(eq(payments.orderId, order.id));
    expect(paymentRows).toHaveLength(1);
  });
});
