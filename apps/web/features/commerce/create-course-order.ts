import "server-only";
import { db, orderCourseGrants, orderItems, orders, type Order } from "@dirakitpro/database";
import { and, eq, gt } from "drizzle-orm";
import { getCourseBySlug } from "@/features/catalog/get-course-by-slug";
import { AlreadyOwnedError, CourseNotPurchasableError } from "./errors";
import { grantEnrollment } from "./grant-enrollment";
import { isUniqueViolation } from "./is-unique-violation";

// PRD 10.1/COM-002 don't specify an exact PENDING order lifetime — 24h is an
// implementation default chosen as a generous-but-bounded checkout window
// (well beyond a single Midtrans Snap session) rather than a product rule.
const ORDER_EXPIRY_MS = 24 * 60 * 60 * 1000;

export type CreateCourseOrderResult =
  | { kind: "free_enrolled"; courseSlug: string }
  | { kind: "order_created"; order: Order }
  | { kind: "order_reused"; order: Order };

async function findReusableOrder(userId: string, courseId: string): Promise<Order | null> {
  const [existing] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.userId, userId),
        eq(orders.courseId, courseId),
        eq(orders.status, "PENDING"),
        eq(orders.sourceType, "DIRECT_COURSE"),
        gt(orders.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return existing ?? null;
}

/**
 * Order creation for a direct course purchase (COM-002, COM-015, COM-016, 10.4).
 * Reuses `getCourseBySlug` for both the PUBLISHED check and the ownership flag
 * — one query already answers both instead of re-querying courses/enrollments.
 */
export async function createCourseOrder(userId: string, courseSlug: string): Promise<CreateCourseOrderResult> {
  const course = await getCourseBySlug(courseSlug, userId);
  if (!course) {
    throw new CourseNotPurchasableError(`Course "${courseSlug}" is not available for purchase.`);
  }
  if (course.isOwned) {
    // COM-016: block before any Order is created.
    throw new AlreadyOwnedError(`You already own "${course.title}".`);
  }

  if (Number(course.price) === 0) {
    // 10.4: free courses skip Order/Payment entirely and go straight to an
    // ACTIVE enrollment via the same idempotent helper the webhook path uses.
    await grantEnrollment(userId, course.id);
    return { kind: "free_enrolled", courseSlug: course.slug };
  }

  const reusable = await findReusableOrder(userId, course.id);
  if (reusable) return { kind: "order_reused", order: reusable };

  try {
    const order = await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId,
          sourceType: "DIRECT_COURSE",
          status: "PENDING",
          courseId: course.id,
          totalAmount: course.price,
          currency: course.currency,
          expiresAt: new Date(Date.now() + ORDER_EXPIRY_MS),
        })
        .returning();

      await tx.insert(orderItems).values({
        orderId: newOrder.id,
        itemType: "COURSE",
        courseId: course.id,
        itemTitle: course.title,
        unitPrice: course.price,
        currency: course.currency,
      });

      // COM-008: uniform OrderCourseGrant row even for a single-course direct order.
      await tx.insert(orderCourseGrants).values({
        orderId: newOrder.id,
        courseId: course.id,
        courseTitleSnapshot: course.title,
      });

      return newOrder;
    });

    return { kind: "order_created", order };
  } catch (error) {
    if (isUniqueViolation(error, "orders_pending_user_course_idx")) {
      // Race: a concurrent call created the PENDING order between our
      // reuse-check and this insert (COM-015) — read it back instead of erroring.
      const raced = await findReusableOrder(userId, course.id);
      if (raced) return { kind: "order_reused", order: raced };
    }
    throw error;
  }
}
