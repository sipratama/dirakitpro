import { createHash } from "node:crypto";
import {
  bundleCourses,
  bundles,
  courses,
  db,
  enrollments,
  orderCourseGrants,
  orderItems,
  orders,
  payments,
  projects,
  type NewBundle,
  type NewCourse,
  type NewOrder,
  users,
} from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { processMidtransNotification, type MidtransNotificationPayload } from "./process-payment-notification";

const SERVER_KEY = "SB-Mid-server-test-key";

function uniqueSlug(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

type NotificationWithoutSignature = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  transaction_status: string;
  fraud_status?: string;
  transaction_id?: string;
};

function withSignature(payload: NotificationWithoutSignature): MidtransNotificationPayload {
  const signature_key = createHash("sha512")
    .update(payload.order_id + payload.status_code + payload.gross_amount + SERVER_KEY)
    .digest("hex");
  return { ...payload, signature_key };
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
  await db.insert(orderCourseGrants).values({ orderId: order.id, courseId, courseTitleSnapshot: "Test Course" });
  await db.insert(payments).values({
    orderId: order.id,
    provider: "MIDTRANS",
    normalizedStatus: "PENDING",
    amount: order.totalAmount,
  });
  return order;
}

async function insertBundleOrder(userId: string, courseIds: string[], overrides: Partial<NewOrder> = {}) {
  const [bundle] = await db
    .insert(bundles)
    .values({
      slug: uniqueSlug("test-bundle"),
      title: "Test Bundle",
      description: "Description",
      type: "FIXED",
      price: "299000",
      status: "ACTIVE",
    } satisfies NewBundle)
    .returning();
  await db.insert(bundleCourses).values(courseIds.map((courseId) => ({ bundleId: bundle.id, courseId })));

  const [order] = await db
    .insert(orders)
    .values({
      userId,
      sourceType: "BUNDLE",
      status: "PENDING",
      bundleId: bundle.id,
      totalAmount: "299000",
      expiresAt: new Date(Date.now() + 60_000),
      ...overrides,
    })
    .returning();
  await db.insert(orderItems).values({
    orderId: order.id,
    itemType: "BUNDLE",
    bundleId: bundle.id,
    itemTitle: "Test Bundle",
    unitPrice: "299000",
  });
  await db.insert(orderCourseGrants).values(
    courseIds.map((courseId) => ({ orderId: order.id, courseId, courseTitleSnapshot: "Test Course" })),
  );
  await db.insert(payments).values({
    orderId: order.id,
    provider: "MIDTRANS",
    normalizedStatus: "PENDING",
    amount: order.totalAmount,
  });
  return { order, bundle };
}

describe("processMidtransNotification", () => {
  const courseIds: string[] = [];
  const bundleIds: string[] = [];
  const userIds: string[] = [];
  const originalServerKey = process.env.MIDTRANS_SERVER_KEY;

  beforeEach(() => {
    process.env.MIDTRANS_SERVER_KEY = SERVER_KEY;
  });

  afterEach(async () => {
    if (userIds.length) {
      const userOrders = await db.select({ id: orders.id }).from(orders).where(inArray(orders.userId, userIds));
      const orderIds = userOrders.map((o) => o.id);
      if (orderIds.length) {
        await db.delete(payments).where(inArray(payments.orderId, orderIds));
        await db.delete(orderCourseGrants).where(inArray(orderCourseGrants.orderId, orderIds));
        await db.delete(orderItems).where(inArray(orderItems.orderId, orderIds));
      }
      await db.delete(orders).where(inArray(orders.userId, userIds));
      await db.delete(projects).where(inArray(projects.userId, userIds));
      await db.delete(enrollments).where(inArray(enrollments.userId, userIds));
    }
    if (bundleIds.length) await db.delete(bundleCourses).where(inArray(bundleCourses.bundleId, bundleIds));
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    bundleIds.length = 0;
    userIds.length = 0;
    process.env.MIDTRANS_SERVER_KEY = originalServerKey;
  });

  it("returns order_not_found for an order_id that doesn't exist", async () => {
    const result = await processMidtransNotification(
      withSignature({
        order_id: "00000000-0000-0000-0000-000000000000",
        status_code: "200",
        gross_amount: "149000.00",
        transaction_status: "settlement",
      }),
    );
    expect(result).toEqual({ kind: "order_not_found" });
  });

  it("transitions PENDING -> PAID and grants exactly one Enrollment for a direct-course order (COM-011)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertDirectCourseOrder(learner.id, course.id, { totalAmount: "149000" });

    const result = await processMidtransNotification(
      withSignature({
        order_id: order.id,
        status_code: "200",
        gross_amount: "149000.00",
        transaction_status: "settlement",
        transaction_id: "mt-txn-1",
      }),
    );

    expect(result.kind).toBe("paid");
    if (result.kind !== "paid") throw new Error("unreachable");
    expect(result.grantedCourseIds).toEqual([course.id]);

    const [updatedOrder] = await db.select().from(orders).where(eq(orders.id, order.id));
    expect(updatedOrder?.status).toBe("PAID");
    expect(updatedOrder?.paidAt).not.toBeNull();

    const [payment] = await db.select().from(payments).where(eq(payments.orderId, order.id));
    expect(payment?.normalizedStatus).toBe("PAID");
    expect(payment?.providerTransactionId).toBe("mt-txn-1");

    const enrollmentRows = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, learner.id));
    expect(enrollmentRows).toHaveLength(1);
    expect(enrollmentRows[0]?.courseId).toBe(course.id);
  });

  it("grants an Enrollment per course for a bundle order (2 courses) in one transition", async () => {
    const courseA = await insertCourse();
    const courseB = await insertCourse();
    courseIds.push(courseA.id, courseB.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const { order, bundle } = await insertBundleOrder(learner.id, [courseA.id, courseB.id]);
    bundleIds.push(bundle.id);

    const result = await processMidtransNotification(
      withSignature({
        order_id: order.id,
        status_code: "200",
        gross_amount: "299000.00",
        transaction_status: "settlement",
      }),
    );

    expect(result.kind).toBe("paid");
    if (result.kind !== "paid") throw new Error("unreachable");
    expect(result.grantedCourseIds.sort()).toEqual([courseA.id, courseB.id].sort());

    const enrollmentRows = await db.select().from(enrollments).where(eq(enrollments.userId, learner.id));
    expect(enrollmentRows).toHaveLength(2);
  });

  it("does NOT repeat the grant when the identical notification arrives twice (webhook retry, COM-011 acceptance)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertDirectCourseOrder(learner.id, course.id, { totalAmount: "149000" });
    const payload = withSignature({
      order_id: order.id,
      status_code: "200",
      gross_amount: "149000.00",
      transaction_status: "settlement",
    });

    const first = await processMidtransNotification(payload);
    const second = await processMidtransNotification(payload);

    expect(first.kind).toBe("paid");
    expect(second.kind).toBe("no_transition");

    const enrollmentRows = await db.select().from(enrollments).where(eq(enrollments.userId, learner.id));
    expect(enrollmentRows).toHaveLength(1);

    const [updatedOrder] = await db.select().from(orders).where(eq(orders.id, order.id));
    expect(updatedOrder?.status).toBe("PAID");
  });

  it("never double-grants under a concurrent race with the identical notification (retry-safety, 15.2)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertDirectCourseOrder(learner.id, course.id, { totalAmount: "149000" });
    const payload = withSignature({
      order_id: order.id,
      status_code: "200",
      gross_amount: "149000.00",
      transaction_status: "settlement",
    });

    const [a, b] = await Promise.all([processMidtransNotification(payload), processMidtransNotification(payload)]);

    const kinds = [a.kind, b.kind].sort();
    expect(kinds).toEqual(["no_transition", "paid"]);

    const enrollmentRows = await db.select().from(enrollments).where(eq(enrollments.userId, learner.id));
    expect(enrollmentRows).toHaveLength(1);
  });

  it("transitions PENDING -> CANCELLED for a denied payment (no Order FAILED state exists)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertDirectCourseOrder(learner.id, course.id, { totalAmount: "149000" });

    const result = await processMidtransNotification(
      withSignature({
        order_id: order.id,
        status_code: "202",
        gross_amount: "149000.00",
        transaction_status: "deny",
      }),
    );

    expect(result.kind).toBe("cancelled");
    const [updatedOrder] = await db.select().from(orders).where(eq(orders.id, order.id));
    expect(updatedOrder?.status).toBe("CANCELLED");

    const enrollmentRows = await db.select().from(enrollments).where(eq(enrollments.userId, learner.id));
    expect(enrollmentRows).toHaveLength(0);
  });

  it("transitions PENDING -> EXPIRED for an expired transaction", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertDirectCourseOrder(learner.id, course.id, { totalAmount: "149000" });

    const result = await processMidtransNotification(
      withSignature({
        order_id: order.id,
        status_code: "407",
        gross_amount: "149000.00",
        transaction_status: "expire",
      }),
    );

    expect(result.kind).toBe("expired");
    const [updatedOrder] = await db.select().from(orders).where(eq(orders.id, order.id));
    expect(updatedOrder?.status).toBe("EXPIRED");
  });
});
