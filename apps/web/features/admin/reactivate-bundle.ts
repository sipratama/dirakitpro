import "server-only";
import { bundles, db, type Bundle } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { BundleCampaignWindowExpiredError, BundleNotFoundError, BundleNotInactiveError } from "./errors";
import { isCampaignWindowValid } from "./is-campaign-window-valid";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 10.3 INACTIVE -> ACTIVE (manual reactivation, ADM-004), "subject to
 * campaign window still being valid" — re-checked here explicitly so an
 * admin cannot reactivate a bundle whose `endsAt` has already passed.
 */
export async function reactivateBundle(bundleId: string): Promise<Bundle> {
  if (!UUID_PATTERN.test(bundleId)) throw new BundleNotFoundError();

  const [existing] = await db.select().from(bundles).where(eq(bundles.id, bundleId)).limit(1);
  if (!existing) throw new BundleNotFoundError();
  if (existing.status !== "INACTIVE") throw new BundleNotInactiveError();
  if (!isCampaignWindowValid(existing)) throw new BundleCampaignWindowExpiredError();

  const [updated] = await db.update(bundles).set({ status: "ACTIVE" }).where(eq(bundles.id, bundleId)).returning();
  return updated;
}
