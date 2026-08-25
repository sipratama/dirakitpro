import { adminAuditLogs, bundles, db, users, type NewBundle } from "@dirakitpro/database";
import { and, eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { activateBundle } from "./activate-bundle";
import { BundleCampaignWindowExpiredError, BundleNotDraftError, BundleNotFoundError } from "./errors";

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
      status: "DRAFT",
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

describe("activateBundle", () => {
  const bundleIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (bundleIds.length) await db.delete(adminAuditLogs).where(and(eq(adminAuditLogs.targetType, "bundle"), inArray(adminAuditLogs.targetId, bundleIds)));
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    bundleIds.length = 0;
    userIds.length = 0;
  });

  it("activates a DRAFT bundle with no campaign window configured", async () => {
    const bundle = await insertBundle();
    bundleIds.push(bundle.id);
    const admin = await insertAdmin();
    userIds.push(admin.id);

    const activated = await activateBundle(bundle.id, admin.id);
    expect(activated.status).toBe("ACTIVE");
  });

  it("activates a DRAFT bundle currently within its campaign window", async () => {
    const bundle = await insertBundle({ startsAt: new Date("2000-01-01T00:00:00Z"), endsAt: new Date("2999-01-01T00:00:00Z") });
    bundleIds.push(bundle.id);
    const admin = await insertAdmin();
    userIds.push(admin.id);

    const activated = await activateBundle(bundle.id, admin.id);
    expect(activated.status).toBe("ACTIVE");
  });

  it("rejects activating a DRAFT bundle whose campaign window has already lapsed", async () => {
    const bundle = await insertBundle({ endsAt: new Date("2000-01-01T00:00:00Z") });
    bundleIds.push(bundle.id);
    const admin = await insertAdmin();
    userIds.push(admin.id);

    await expect(activateBundle(bundle.id, admin.id)).rejects.toThrow(BundleCampaignWindowExpiredError);
  });

  it("rejects activating a bundle that isn't DRAFT", async () => {
    const bundle = await insertBundle({ status: "INACTIVE" });
    bundleIds.push(bundle.id);
    const admin = await insertAdmin();
    userIds.push(admin.id);

    await expect(activateBundle(bundle.id, admin.id)).rejects.toThrow(BundleNotDraftError);
  });

  it("throws for a nonexistent bundle id", async () => {
    const admin = await insertAdmin();
    userIds.push(admin.id);

    await expect(activateBundle("00000000-0000-0000-0000-000000000000", admin.id)).rejects.toThrow(BundleNotFoundError);
  });

  it("writes exactly one audit log row with the correct before/after snapshot", async () => {
    const bundle = await insertBundle();
    bundleIds.push(bundle.id);
    const admin = await insertAdmin();
    userIds.push(admin.id);

    await activateBundle(bundle.id, admin.id);

    const logs = await db.select().from(adminAuditLogs).where(eq(adminAuditLogs.targetId, bundle.id));
    expect(logs).toHaveLength(1);
    expect(logs[0]?.action).toBe("BUNDLE_ACTIVATED");
    expect(logs[0]?.adminUserId).toBe(admin.id);
    expect(logs[0]?.targetType).toBe("bundle");
    expect(logs[0]?.beforeData).toEqual({ status: "DRAFT" });
    expect(logs[0]?.afterData).toEqual({ status: "ACTIVE" });
  });
});
