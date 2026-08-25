import "server-only";
import { adminAuditLogs, bundles, db, type Bundle } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { BundleCampaignWindowExpiredError, BundleNotFoundError, BundleNotInactiveError } from "./errors";
import { isCampaignWindowValid } from "./is-campaign-window-valid";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 10.3 INACTIVE -> ACTIVE (manual reactivation, ADM-004), "subject to
 * campaign window still being valid" — re-checked here explicitly so an
 * admin cannot reactivate a bundle whose `endsAt` has already passed.
 *
 * Writes the AdminAuditLog row (ADM-008) in the same transaction as the
 * bundle update.
 */
export async function reactivateBundle(bundleId: string, adminUserId: string): Promise<Bundle> {
  if (!UUID_PATTERN.test(bundleId)) throw new BundleNotFoundError();

  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(bundles).where(eq(bundles.id, bundleId)).limit(1);
    if (!existing) throw new BundleNotFoundError();
    if (existing.status !== "INACTIVE") throw new BundleNotInactiveError();
    if (!isCampaignWindowValid(existing)) throw new BundleCampaignWindowExpiredError();

    const [updated] = await tx.update(bundles).set({ status: "ACTIVE" }).where(eq(bundles.id, bundleId)).returning();

    await tx.insert(adminAuditLogs).values({
      adminUserId,
      action: "BUNDLE_REACTIVATED",
      targetType: "bundle",
      targetId: bundleId,
      beforeData: { status: existing.status },
      afterData: { status: "ACTIVE" },
    });

    return updated;
  });
}
