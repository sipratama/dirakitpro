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
  type NewBundle,
  type NewCourse,
  type NewOrder,
  users,
} from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SERVER_KEY = "SB-Mid-server-test-key";
const mockSendEmail = vi.fn();

vi.mock("@dirakitpro/email", () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

const { POST } = await import("./route");

function uniqueSlug(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function signPayload(payload: Record<string, unknown>) {
  const signature_key = createHash("sha512")
    .update(String(payload.order_id) + String(payload.status_code) + String(payload.gross_amount) + SERVER_KEY)
    .digest("hex");
  return { ...payload, signature_key };
}

function webhookRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/payments/midtrans/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function insertCourse(overrides: Partial<NewCourse> = {}) {
  const [course] = await db
    .insert(courses)
    .values({
      slug: uniqueSlug("test-course"),
      title: overrides.title ?? "Test Course",
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

async function insertBundleOrder(userId: string, courseIds: string[]) {
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

describe("POST /api/payments/midtrans/webhook", () => {
  const courseIds: string[] = [];
  const bundleIds: string[] = [];
  const userIds: string[] = [];
  const originalServerKey = process.env.MIDTRANS_SERVER_KEY;

  beforeEach(() => {
    mockSendEmail.mockReset();
    mockSendEmail.mockResolvedValue(undefined);
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

  it("PAID webhook with a valid signature marks the Order PAID, grants the Enrollment, and sends exactly one email", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertDirectCourseOrder(learner.id, course.id);

    const response = await POST(
      webhookRequest(
        signPayload({
          order_id: order.id,
          status_code: "200",
          gross_amount: "149000.00",
          transaction_status: "settlement",
        }),
      ),
    );

    expect(response.status).toBe(200);

    const [updatedOrder] = await db.select().from(orders).where(eq(orders.id, order.id));
    expect(updatedOrder?.status).toBe("PAID");

    const enrollmentRows = await db.select().from(enrollments).where(eq(enrollments.userId, learner.id));
    expect(enrollmentRows).toHaveLength(1);

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail.mock.calls[0]![0].to).toBe(learner.email);
  });

  it("does not repeat the Enrollment grant or send a second email when Midtrans retries the identical webhook", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertDirectCourseOrder(learner.id, course.id);
    const body = signPayload({
      order_id: order.id,
      status_code: "200",
      gross_amount: "149000.00",
      transaction_status: "settlement",
    });

    const first = await POST(webhookRequest(body));
    const second = await POST(webhookRequest(body));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    const enrollmentRows = await db.select().from(enrollments).where(eq(enrollments.userId, learner.id));
    expect(enrollmentRows).toHaveLength(1);
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
  });

  it("rejects a notification with an invalid signature and leaves all state unchanged", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const order = await insertDirectCourseOrder(learner.id, course.id);

    const response = await POST(
      webhookRequest({
        order_id: order.id,
        status_code: "200",
        gross_amount: "149000.00",
        transaction_status: "settlement",
        signature_key: "tampered-signature-not-computed-with-server-key",
      }),
    );

    expect(response.status).toBe(403);

    const [unchangedOrder] = await db.select().from(orders).where(eq(orders.id, order.id));
    expect(unchangedOrder?.status).toBe("PENDING");

    const [unchangedPayment] = await db.select().from(payments).where(eq(payments.orderId, order.id));
    expect(unchangedPayment?.normalizedStatus).toBe("PENDING");

    const enrollmentRows = await db.select().from(enrollments).where(eq(enrollments.userId, learner.id));
    expect(enrollmentRows).toHaveLength(0);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("sends exactly one consolidated email listing both courses for a bundle order (NTF-003)", async () => {
    const courseA = await insertCourse({ title: "Rakit Aplikasi Keuangan Pribadi" });
    const courseB = await insertCourse({ title: "Rakit Sistem Booking Bisnis" });
    courseIds.push(courseA.id, courseB.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const { order, bundle } = await insertBundleOrder(learner.id, [courseA.id, courseB.id]);
    bundleIds.push(bundle.id);

    const response = await POST(
      webhookRequest(
        signPayload({
          order_id: order.id,
          status_code: "200",
          gross_amount: "299000.00",
          transaction_status: "settlement",
        }),
      ),
    );

    expect(response.status).toBe(200);

    const enrollmentRows = await db.select().from(enrollments).where(eq(enrollments.userId, learner.id));
    expect(enrollmentRows).toHaveLength(2);

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    const emailHtml = mockSendEmail.mock.calls[0]![0].html as string;
    expect(emailHtml).toContain("Rakit Aplikasi Keuangan Pribadi");
    expect(emailHtml).toContain("Rakit Sistem Booking Bisnis");
  });
});
