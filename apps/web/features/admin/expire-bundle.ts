import "server-only";
import { adminAuditLogs, bundles, db, type Bundle } from "@dirakitpro/database";
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
 * This is system-triggered, not an admin action — the AdminAuditLog row is
 * written with `adminUserId: null` (ADM-008), never attributed to whichever
 * admin happened to trigger the read that caused this to run.
 */
export async function expireBundle(bundleId: string): Promise<Bundle> {
  if (!UUID_PATTERN.test(bundleId)) throw new BundleNotFoundError();

  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(bundles).where(eq(bundles.id, bundleId)).limit(1);
    if (!existing) throw new BundleNotFoundError();
    if (existing.status !== "ACTIVE") throw new BundleNotActiveError();

    const [updated] = await tx.update(bundles).set({ status: "EXPIRED" }).where(eq(bundles.id, bundleId)).returning();

    await tx.insert(adminAuditLogs).values({
      adminUserId: null,
      action: "BUNDLE_EXPIRED",
      targetType: "bundle",
      targetId: bundleId,
      beforeData: { status: existing.status },
      afterData: { status: "EXPIRED" },
    });

    return updated;
  });
}
