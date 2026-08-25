import "server-only";
import { bundles, db, type Bundle } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { BundleCampaignWindowExpiredError, BundleNotDraftError, BundleNotFoundError } from "./errors";
import { isCampaignWindowValid } from "./is-campaign-window-valid";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 10.3 DRAFT -> ACTIVE (first activation, ADM-004). Also checked against the
 * campaign window: 10.3's own text is unconditional ("ACTIVE tetap harus
 * memenuhi campaign window ... jika kedua batas waktu dikonfigurasi"), not
 * scoped to only the reactivate path, so activating a bundle whose window has
 * already lapsed is rejected the same way reactivateBundle rejects it.
 */
export async function activateBundle(bundleId: string): Promise<Bundle> {
  if (!UUID_PATTERN.test(bundleId)) throw new BundleNotFoundError();

  const [existing] = await db.select().from(bundles).where(eq(bundles.id, bundleId)).limit(1);
  if (!existing) throw new BundleNotFoundError();
  if (existing.status !== "DRAFT") throw new BundleNotDraftError();
  if (!isCampaignWindowValid(existing)) throw new BundleCampaignWindowExpiredError();

  const [updated] = await db.update(bundles).set({ status: "ACTIVE" }).where(eq(bundles.id, bundleId)).returning();
  return updated;
}
