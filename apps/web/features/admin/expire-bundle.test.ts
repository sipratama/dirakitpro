import { adminAuditLogs, bundles, db, type NewBundle } from "@dirakitpro/database";
import { and, eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { expireBundle } from "./expire-bundle";
import { BundleNotActiveError, BundleNotFoundError } from "./errors";

function uniqueSlug(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

async function insertBundle(overrides: Partial<NewBundle> = {}) {
  const [bundle] = await db
    .insert(bundles)
    .values({
      slug: uniqueSlug("test-bundle"),
      title: "Test Bundle",
      description: "Description",
      type: "FIXED",
      price: "299000",
      status: "ACTIVE",
      ...overrides,
    })
    .returning();
  return bundle;
}

describe("expireBundle", () => {
  const bundleIds: string[] = [];

  afterEach(async () => {
    if (bundleIds.length) await db.delete(adminAuditLogs).where(and(eq(adminAuditLogs.targetType, "bundle"), inArray(adminAuditLogs.targetId, bundleIds)));
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    bundleIds.length = 0;
  });

  it("transitions an ACTIVE bundle to EXPIRED", async () => {
    const bundle = await insertBundle();
    bundleIds.push(bundle.id);

    const result = await expireBundle(bundle.id);
    expect(result.status).toBe("EXPIRED");
  });

  it("rejects expiring a bundle that isn't ACTIVE", async () => {
    const bundle = await insertBundle({ status: "DRAFT" });
    bundleIds.push(bundle.id);

    await expect(expireBundle(bundle.id)).rejects.toThrow(BundleNotActiveError);
  });

  it("throws for a nonexistent bundle id", async () => {
    await expect(expireBundle("00000000-0000-0000-0000-000000000000")).rejects.toThrow(BundleNotFoundError);
  });

  // System-triggered, not an admin action (10.3: automatic once now > ends_at)
  // — the audit row must record no admin actor, not attribute it to anyone.
  it("writes exactly one audit log row with adminUserId null (system-triggered, not an admin action)", async () => {
    const bundle = await insertBundle();
    bundleIds.push(bundle.id);

    await expireBundle(bundle.id);

    const logs = await db.select().from(adminAuditLogs).where(eq(adminAuditLogs.targetId, bundle.id));
    expect(logs).toHaveLength(1);
    expect(logs[0]?.action).toBe("BUNDLE_EXPIRED");
    expect(logs[0]?.adminUserId).toBeNull();
    expect(logs[0]?.beforeData).toEqual({ status: "ACTIVE" });
    expect(logs[0]?.afterData).toEqual({ status: "EXPIRED" });
  });
});
