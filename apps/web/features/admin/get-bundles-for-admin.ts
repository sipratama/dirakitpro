import "server-only";
import { bundles, db, type Bundle } from "@dirakitpro/database";
import { desc } from "drizzle-orm";
import { expireBundle } from "./expire-bundle";
import { isCampaignWindowValid } from "./is-campaign-window-valid";

/**
 * All bundles across every status (ADM-004) — the public catalog
 * (getActiveBundles) only surfaces ACTIVE-and-in-window.
 *
 * Self-heals the ACTIVE -> EXPIRED transition (10.3) on read: there's no
 * scheduler/cron in this monolith (14.1) to flip a stale ACTIVE bundle once
 * its window lapses, so this list — the admin's own view of bundle state —
 * is the trigger point instead.
 */
export async function getBundlesForAdmin(): Promise<Bundle[]> {
  const rows = await db.select().from(bundles).orderBy(desc(bundles.createdAt));

  return Promise.all(
    rows.map((bundle) => (bundle.status === "ACTIVE" && !isCampaignWindowValid(bundle) ? expireBundle(bundle.id) : bundle)),
  );
}
