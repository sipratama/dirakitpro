import { bundles, db, type NewBundle } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { BundleCampaignWindowExpiredError, BundleNotFoundError, BundleNotInactiveError } from "./errors";
import { reactivateBundle } from "./reactivate-bundle";

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
      status: "INACTIVE",
      ...overrides,
    })
    .returning();
  return bundle;
}

describe("reactivateBundle", () => {
  const bundleIds: string[] = [];

  afterEach(async () => {
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    bundleIds.length = 0;
  });

  it("reactivates an INACTIVE bundle whose window is still valid", async () => {
    const bundle = await insertBundle({ endsAt: new Date("2999-01-01T00:00:00Z") });
    bundleIds.push(bundle.id);

    const result = await reactivateBundle(bundle.id);
    expect(result.status).toBe("ACTIVE");
  });

  it("rejects reactivating an INACTIVE bundle whose endsAt has already passed", async () => {
    const bundle = await insertBundle({ endsAt: new Date("2000-01-01T00:00:00Z") });
    bundleIds.push(bundle.id);

    await expect(reactivateBundle(bundle.id)).rejects.toThrow(BundleCampaignWindowExpiredError);
  });

  it("rejects reactivating a bundle that isn't INACTIVE (e.g. EXPIRED has no path back)", async () => {
    const bundle = await insertBundle({ status: "EXPIRED" });
    bundleIds.push(bundle.id);

    await expect(reactivateBundle(bundle.id)).rejects.toThrow(BundleNotInactiveError);
  });

  it("throws for a nonexistent bundle id", async () => {
    await expect(reactivateBundle("00000000-0000-0000-0000-000000000000")).rejects.toThrow(BundleNotFoundError);
  });
});
