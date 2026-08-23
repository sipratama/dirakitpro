import "server-only";
import { db, orderCourseGrants, orderItems, orders, type Order } from "@dirakitpro/database";
import { and, eq, gt } from "drizzle-orm";
import { getBundleBySlug, type BundleDetail } from "@/features/catalog/get-bundle-by-slug";
import { isBundlePurchasable } from "@/features/catalog/is-bundle-purchasable";
import { BundleNotPurchasableError, BundleSelectionError } from "./errors";
import { isUniqueViolation } from "./is-unique-violation";

// Same rationale as create-course-order.ts's ORDER_EXPIRY_MS.
const ORDER_EXPIRY_MS = 24 * 60 * 60 * 1000;

export type CreateBundleOrderResult =
  | { kind: "order_created"; order: Order }
  | { kind: "order_reused"; order: Order }
  | { kind: "existing_order_selection_mismatch"; existingOrder: Order };

type GrantCourse = { id: string; title: string };

/**
 * Validates/resolves which courses this purchase will grant, WITHOUT touching
 * the database — pure so the exact-N/eligibility/ownership checks (COM-005,
 * COM-007) can reject before any Order is created.
 *
 * FIXED bundles have no selection to validate. Per COM-007's literal scope
 * (CHOOSE_N only), the PRD does not forbid buying a FIXED bundle while already
 * owning some of its included courses — treated here as: purchase stays
 * allowed, but already-owned courses are skipped from the grant snapshot so
 * enrollment activation (COM-011) never double-grants. Flagged for review in
 * the Fase 1 summary, not decided silently.
 */
function resolveGrantCourses(bundle: BundleDetail, selectedCourseIds: string[] | undefined): GrantCourse[] {
  if (bundle.type === "FIXED") {
    return bundle.courses.filter((course) => !course.alreadyOwned).map((course) => ({ id: course.id, title: course.title }));
  }

  const selectionCount = bundle.selectionCount;
  if (selectionCount == null) {
    throw new BundleSelectionError(`Bundle "${bundle.slug}" is CHOOSE_N but has no selectionCount configured.`);
  }
  if (!selectedCourseIds || selectedCourseIds.length !== selectionCount) {
    throw new BundleSelectionError(`Pilih tepat ${selectionCount} course untuk membeli bundle ini.`);
  }

  const uniqueIds = new Set(selectedCourseIds);
  if (uniqueIds.size !== selectionCount) {
    throw new BundleSelectionError(`Pilihan course tidak boleh duplikat.`);
  }

  const eligibleById = new Map(bundle.courses.map((course) => [course.id, course]));
  const grants: GrantCourse[] = [];
  for (const id of uniqueIds) {
    const course = eligibleById.get(id);
    if (!course) {
      throw new BundleSelectionError(`Course yang dipilih tidak eligible untuk bundle ini.`);
    }
    if (course.alreadyOwned) {
      // COM-007
      throw new BundleSelectionError(`Course "${course.title}" sudah kamu miliki dan tidak dapat dipilih ulang.`);
    }
    grants.push({ id: course.id, title: course.title });
  }
  return grants;
}

async function findPendingBundleOrder(userId: string, bundleId: string): Promise<Order | null> {
  const [existing] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.userId, userId),
        eq(orders.bundleId, bundleId),
        eq(orders.status, "PENDING"),
        eq(orders.sourceType, "BUNDLE"),
        gt(orders.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return existing ?? null;
}

/**
 * COM-015 reuse check. FIXED has no selection, so any existing PENDING order
 * reuses directly. CHOOSE_N compares the newly requested selection against the
 * grant snapshot already recorded on the existing order (immutable per
 * COM-008) — a different selection does NOT mutate that order, it's surfaced
 * as a mismatch so the caller can offer "cancel & reselect".
 */
async function resolveExistingBundleOrder(
  userId: string,
  bundle: BundleDetail,
  selectedCourseIds: string[] | undefined,
): Promise<CreateBundleOrderResult | null> {
  const existingOrder = await findPendingBundleOrder(userId, bundle.id);
  if (!existingOrder) return null;

  if (bundle.type === "FIXED") {
    return { kind: "order_reused", order: existingOrder };
  }

  const existingGrants = await db
    .select({ courseId: orderCourseGrants.courseId })
    .from(orderCourseGrants)
    .where(eq(orderCourseGrants.orderId, existingOrder.id));
  const existingSet = new Set(existingGrants.map((row) => row.courseId));
  const requestedSet = new Set(selectedCourseIds ?? []);
  const sameSelection =
    existingSet.size === requestedSet.size && [...existingSet].every((id) => requestedSet.has(id));

  if (sameSelection) return { kind: "order_reused", order: existingOrder };
  return { kind: "existing_order_selection_mismatch", existingOrder };
}

export async function createBundleOrder(
  userId: string,
  bundleSlug: string,
  selectedCourseIds?: string[],
): Promise<CreateBundleOrderResult> {
  const bundle = await getBundleBySlug(bundleSlug, userId);
  if (!bundle) {
    throw new BundleNotPurchasableError(`Bundle "${bundleSlug}" does not exist.`);
  }
  if (!isBundlePurchasable(bundle)) {
    throw new BundleNotPurchasableError(`Bundle "${bundle.title}" is not currently available for purchase.`);
  }

  const existingResult = await resolveExistingBundleOrder(userId, bundle, selectedCourseIds);
  if (existingResult) return existingResult;

  // Validate BEFORE creating any Order (COM-005 acceptance).
  const grants = resolveGrantCourses(bundle, selectedCourseIds);

  try {
    const order = await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId,
          sourceType: "BUNDLE",
          status: "PENDING",
          bundleId: bundle.id,
          totalAmount: bundle.price,
          currency: bundle.currency,
          expiresAt: new Date(Date.now() + ORDER_EXPIRY_MS),
        })
        .returning();

      await tx.insert(orderItems).values({
        orderId: newOrder.id,
        itemType: "BUNDLE",
        bundleId: bundle.id,
        itemTitle: bundle.title,
        unitPrice: bundle.price,
        currency: bundle.currency,
      });

      if (grants.length > 0) {
        await tx.insert(orderCourseGrants).values(
          grants.map((grant) => ({
            orderId: newOrder.id,
            courseId: grant.id,
            courseTitleSnapshot: grant.title,
          })),
        );
      }

      return newOrder;
    });

    return { kind: "order_created", order };
  } catch (error) {
    if (isUniqueViolation(error, "orders_pending_user_bundle_idx")) {
      // Race: a concurrent call created the PENDING order between our
      // reuse-check and this insert — resolve it the same way as the pre-check.
      const raced = await resolveExistingBundleOrder(userId, bundle, selectedCourseIds);
      if (raced) return raced;
    }
    throw error;
  }
}
