import {
  bundleCourses,
  bundles,
  courses,
  db,
  enrollments,
  orderCourseGrants,
  orderItems,
  orders,
  type NewBundle,
  type NewCourse,
  users,
} from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createBundleOrder } from "./create-bundle-order";
import { BundleNotPurchasableError, BundleSelectionError } from "./errors";

function uniqueSlug(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

async function insertBundle(overrides: Partial<NewBundle> = {}) {
  const [bundle] = await db
    .insert(bundles)
    .values({
      slug: uniqueSlug("test-bundle"),
      title: "Test Bundle",
      description: "Description",
      type: "CHOOSE_N",
      selectionCount: 2,
      price: "299000",
      status: "ACTIVE",
      ...overrides,
    })
    .returning();
  return bundle;
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

describe("createBundleOrder", () => {
  const bundleIds: string[] = [];
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
      await db.delete(enrollments).where(inArray(enrollments.userId, userIds));
    }
    if (bundleIds.length) await db.delete(bundleCourses).where(inArray(bundleCourses.bundleId, bundleIds));
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    bundleIds.length = 0;
    courseIds.length = 0;
    userIds.length = 0;
  });

  async function setUpChooseNBundle() {
    const bundle = await insertBundle({ type: "CHOOSE_N", selectionCount: 2 });
    bundleIds.push(bundle.id);
    const courseA = await insertCourse();
    const courseB = await insertCourse();
    const courseC = await insertCourse();
    courseIds.push(courseA.id, courseB.id, courseC.id);
    await db.insert(bundleCourses).values([
      { bundleId: bundle.id, courseId: courseA.id },
      { bundleId: bundle.id, courseId: courseB.id },
      { bundleId: bundle.id, courseId: courseC.id },
    ]);
    const learner = await insertLearner();
    userIds.push(learner.id);
    return { bundle, courseA, courseB, courseC, learner };
  }

  it("rejects a nonexistent bundle slug and an INACTIVE bundle before creating any Order (COM-006)", async () => {
    const { learner } = await setUpChooseNBundle();
    const inactiveBundle = await insertBundle({ status: "INACTIVE" });
    bundleIds.push(inactiveBundle.id);

    await expect(createBundleOrder(learner.id, "does-not-exist", [])).rejects.toThrow(BundleNotPurchasableError);
    await expect(createBundleOrder(learner.id, inactiveBundle.slug, [])).rejects.toThrow(BundleNotPurchasableError);

    const orderRows = await db.select().from(orders).where(eq(orders.userId, learner.id));
    expect(orderRows).toHaveLength(0);
  });

  it("rejects a CHOOSE_N selection with the wrong count before creating any Order (COM-005)", async () => {
    const { bundle, courseA, learner } = await setUpChooseNBundle();

    await expect(createBundleOrder(learner.id, bundle.slug, [courseA.id])).rejects.toThrow(BundleSelectionError);

    const orderRows = await db.select().from(orders).where(eq(orders.userId, learner.id));
    expect(orderRows).toHaveLength(0);
  });

  it("rejects a CHOOSE_N selection containing a non-eligible course before creating any Order", async () => {
    const { bundle, courseA, learner } = await setUpChooseNBundle();
    const outsideCourse = await insertCourse();
    courseIds.push(outsideCourse.id);

    await expect(createBundleOrder(learner.id, bundle.slug, [courseA.id, outsideCourse.id])).rejects.toThrow(
      BundleSelectionError,
    );

    const orderRows = await db.select().from(orders).where(eq(orders.userId, learner.id));
    expect(orderRows).toHaveLength(0);
  });

  it("rejects a CHOOSE_N selection containing an already-owned course before creating any Order (COM-007)", async () => {
    const { bundle, courseA, courseB, learner } = await setUpChooseNBundle();
    await db.insert(enrollments).values({ userId: learner.id, courseId: courseA.id, status: "ACTIVE" });

    await expect(createBundleOrder(learner.id, bundle.slug, [courseA.id, courseB.id])).rejects.toThrow(
      BundleSelectionError,
    );

    const orderRows = await db.select().from(orders).where(eq(orders.userId, learner.id));
    expect(orderRows).toHaveLength(0);
  });

  it("creates a PENDING Order with an immutable grant snapshot for a valid CHOOSE_N selection", async () => {
    const { bundle, courseA, courseB, learner } = await setUpChooseNBundle();

    const result = await createBundleOrder(learner.id, bundle.slug, [courseA.id, courseB.id]);

    expect(result.kind).toBe("order_created");
    if (result.kind !== "order_created") throw new Error("unreachable");
    expect(result.order.totalAmount).toBe("299000.00");

    const grants = await db.select().from(orderCourseGrants).where(eq(orderCourseGrants.orderId, result.order.id));
    expect(grants.map((g) => g.courseId).sort()).toEqual([courseA.id, courseB.id].sort());
  });

  it("reuses the existing PENDING order when the same CHOOSE_N selection is requested again (COM-015)", async () => {
    const { bundle, courseA, courseB, learner } = await setUpChooseNBundle();

    const first = await createBundleOrder(learner.id, bundle.slug, [courseA.id, courseB.id]);
    const second = await createBundleOrder(learner.id, bundle.slug, [courseB.id, courseA.id]);

    expect(first.kind).toBe("order_created");
    expect(second.kind).toBe("order_reused");
    if (first.kind !== "order_created" || second.kind !== "order_reused") throw new Error("unreachable");
    expect(second.order.id).toBe(first.order.id);

    const orderRows = await db.select().from(orders).where(eq(orders.userId, learner.id));
    expect(orderRows).toHaveLength(1);
  });

  it("flags a selection mismatch WITHOUT mutating the existing order's grant snapshot", async () => {
    const { bundle, courseA, courseB, courseC, learner } = await setUpChooseNBundle();

    const first = await createBundleOrder(learner.id, bundle.slug, [courseA.id, courseB.id]);
    if (first.kind !== "order_created") throw new Error("unreachable");

    const second = await createBundleOrder(learner.id, bundle.slug, [courseA.id, courseC.id]);

    expect(second.kind).toBe("existing_order_selection_mismatch");
    if (second.kind !== "existing_order_selection_mismatch") throw new Error("unreachable");
    expect(second.existingOrder.id).toBe(first.order.id);

    const grants = await db.select().from(orderCourseGrants).where(eq(orderCourseGrants.orderId, first.order.id));
    expect(grants.map((g) => g.courseId).sort()).toEqual([courseA.id, courseB.id].sort());

    const orderRows = await db.select().from(orders).where(eq(orders.userId, learner.id));
    expect(orderRows).toHaveLength(1);
  });

  it("grants all included courses for a FIXED bundle with no ownership overlap", async () => {
    const bundle = await insertBundle({ type: "FIXED", selectionCount: null });
    bundleIds.push(bundle.id);
    const courseA = await insertCourse();
    const courseB = await insertCourse();
    courseIds.push(courseA.id, courseB.id);
    await db.insert(bundleCourses).values([
      { bundleId: bundle.id, courseId: courseA.id },
      { bundleId: bundle.id, courseId: courseB.id },
    ]);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const result = await createBundleOrder(learner.id, bundle.slug);

    expect(result.kind).toBe("order_created");
    if (result.kind !== "order_created") throw new Error("unreachable");
    const grants = await db.select().from(orderCourseGrants).where(eq(orderCourseGrants.orderId, result.order.id));
    expect(grants.map((g) => g.courseId).sort()).toEqual([courseA.id, courseB.id].sort());
  });

  it("skips already-owned courses from the grant snapshot for a FIXED bundle, but still allows the purchase", async () => {
    const bundle = await insertBundle({ type: "FIXED", selectionCount: null });
    bundleIds.push(bundle.id);
    const owned = await insertCourse();
    const unowned = await insertCourse();
    courseIds.push(owned.id, unowned.id);
    await db.insert(bundleCourses).values([
      { bundleId: bundle.id, courseId: owned.id },
      { bundleId: bundle.id, courseId: unowned.id },
    ]);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(enrollments).values({ userId: learner.id, courseId: owned.id, status: "ACTIVE" });

    const result = await createBundleOrder(learner.id, bundle.slug);

    expect(result.kind).toBe("order_created");
    if (result.kind !== "order_created") throw new Error("unreachable");
    expect(result.order.totalAmount).toBe(bundle.price); // full bundle price regardless of partial ownership
    const grants = await db.select().from(orderCourseGrants).where(eq(orderCourseGrants.orderId, result.order.id));
    expect(grants.map((g) => g.courseId)).toEqual([unowned.id]);
  });

  it("never creates two simultaneous PENDING orders for the same user+bundle under a concurrent race with identical selections (COM-015)", async () => {
    const { bundle, courseA, courseB, learner } = await setUpChooseNBundle();

    const [a, b] = await Promise.all([
      createBundleOrder(learner.id, bundle.slug, [courseA.id, courseB.id]),
      createBundleOrder(learner.id, bundle.slug, [courseA.id, courseB.id]),
    ]);

    const orderIdOf = (result: Awaited<ReturnType<typeof createBundleOrder>>) =>
      "order" in result ? result.order.id : null;
    expect(orderIdOf(a)).toBe(orderIdOf(b));

    const orderRows = await db.select().from(orders).where(eq(orders.userId, learner.id));
    expect(orderRows).toHaveLength(1);
  });
});
