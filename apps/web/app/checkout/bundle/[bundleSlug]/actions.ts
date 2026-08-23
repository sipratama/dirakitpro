"use server";

import { getCurrentUser } from "@dirakitpro/auth";
import { redirect } from "next/navigation";
import { cancelOrder } from "@/features/commerce/cancel-order";

/**
 * "Batalkan & pilih ulang" (Fase 4) — used when createBundleOrder() returns
 * `existing_order_selection_mismatch`. Re-checks auth itself: Server Actions
 * are reachable via direct POST, not only through this page's own form.
 */
export async function cancelMismatchedOrderAction(orderId: string, bundleSlug: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await cancelOrder(orderId, user.id);
  redirect(`/bundles/${bundleSlug}`);
}
