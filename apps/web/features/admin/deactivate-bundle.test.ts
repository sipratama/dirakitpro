import { adminAuditLogs, bundles, db, users, type NewBundle } from "@dirakitpro/database";
import { and, eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { deactivateBundle } from "./deactivate-bundle";
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

async function insertAdmin() {
  const [admin] = await db
    .insert(users)
    .values({
      email: `${uniqueSlug("admin")}@example.com`,
      username: uniqueSlug("admin"),
      displayName: "Test Admin",
      role: "ADMIN",
    })
    .returning();
  return admin;
}

describe("deactivateBundle", () => {
  const bundleIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (bundleIds.length) await db.delete(adminAuditLogs).where(and(eq(adminAuditLogs.targetType, "bundle"), inArray(adminAuditLogs.targetId, bundleIds)));
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    bundleIds.length = 0;
    userIds.length = 0;
  });

  it("deactivates an ACTIVE bundle", async () => {
    const bundle = await insertBundle();
    bundleIds.push(bundle.id);
    const admin = await insertAdmin();
    userIds.push(admin.id);

    const result = await deactivateBundle(bundle.id, admin.id);
    expect(result.status).toBe("INACTIVE");
  });

  it("rejects deactivating a bundle that isn't ACTIVE", async () => {
    const bundle = await insertBundle({ status: "DRAFT" });
    bundleIds.push(bundle.id);
    const admin = await insertAdmin();
    userIds.push(admin.id);

    await expect(deactivateBundle(bundle.id, admin.id)).rejects.toThrow(BundleNotActiveError);
  });

  it("throws for a nonexistent bundle id", async () => {
    const admin = await insertAdmin();
    userIds.push(admin.id);

    await expect(deactivateBundle("00000000-0000-0000-0000-000000000000", admin.id)).rejects.toThrow(BundleNotFoundError);
  });

  it("writes exactly one audit log row with the correct before/after snapshot", async () => {
    const bundle = await insertBundle();
    bundleIds.push(bundle.id);
    const admin = await insertAdmin();
    userIds.push(admin.id);

    await deactivateBundle(bundle.id, admin.id);

    const logs = await db.select().from(adminAuditLogs).where(eq(adminAuditLogs.targetId, bundle.id));
    expect(logs).toHaveLength(1);
    expect(logs[0]?.action).toBe("BUNDLE_DEACTIVATED");
    expect(logs[0]?.adminUserId).toBe(admin.id);
    expect(logs[0]?.beforeData).toEqual({ status: "ACTIVE" });
    expect(logs[0]?.afterData).toEqual({ status: "INACTIVE" });
  });
});
