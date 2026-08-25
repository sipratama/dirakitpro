import "server-only";
import { bundles, db, type Bundle } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { BundleNotActiveError, BundleNotFoundError } from "./errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 10.3 ACTIVE -> INACTIVE (manual deactivation, ADM-004). Doesn't retroactively affect Orders already created against this bundle (COM-006). */
export async function deactivateBundle(bundleId: string): Promise<Bundle> {
  if (!UUID_PATTERN.test(bundleId)) throw new BundleNotFoundError();

  const [existing] = await db.select().from(bundles).where(eq(bundles.id, bundleId)).limit(1);
  if (!existing) throw new BundleNotFoundError();
  if (existing.status !== "ACTIVE") throw new BundleNotActiveError();

  const [updated] = await db.update(bundles).set({ status: "INACTIVE" }).where(eq(bundles.id, bundleId)).returning();
  return updated;
}
