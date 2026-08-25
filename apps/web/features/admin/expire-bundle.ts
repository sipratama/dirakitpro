import "server-only";
import { bundles, db, type Bundle } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { BundleNotActiveError, BundleNotFoundError } from "./errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 10.3 ACTIVE -> EXPIRED, "automatic, once now > ends_at". Not named in this
 * wave's Fase 2 function list, but added there anyway (see phase summary):
 * Fase 3 requires a BUNDLE_EXPIRED audit action for this exact transition,
 * which needs a transition function to attach to. There is no scheduler/cron
 * in this monolith (14.1), so this isn't invoked by a background job — it's
 * called lazily wherever an admin bundle read (get-bundle(s)-for-admin)
 * notices a stored ACTIVE bundle whose window has actually lapsed, the same
 * "self-heal on read" shape the catalog module already uses to *compute*
 * (not persist) purchasability live.
 *
 * This is system-triggered, not an admin action — callers must pass
 * `adminUserId: null` to the Fase 3 audit write, never attribute it to
 * whichever admin happened to trigger the read.
 */
export async function expireBundle(bundleId: string): Promise<Bundle> {
  if (!UUID_PATTERN.test(bundleId)) throw new BundleNotFoundError();

  const [existing] = await db.select().from(bundles).where(eq(bundles.id, bundleId)).limit(1);
  if (!existing) throw new BundleNotFoundError();
  if (existing.status !== "ACTIVE") throw new BundleNotActiveError();

  const [updated] = await db.update(bundles).set({ status: "EXPIRED" }).where(eq(bundles.id, bundleId)).returning();
  return updated;
}
