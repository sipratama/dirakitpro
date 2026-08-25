import { bundles, db, type NewBundle } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
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

describe("deactivateBundle", () => {
  const bundleIds: string[] = [];

  afterEach(async () => {
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    bundleIds.length = 0;
  });

  it("deactivates an ACTIVE bundle", async () => {
    const bundle = await insertBundle();
    bundleIds.push(bundle.id);

    const result = await deactivateBundle(bundle.id);
    expect(result.status).toBe("INACTIVE");
  });

  it("rejects deactivating a bundle that isn't ACTIVE", async () => {
    const bundle = await insertBundle({ status: "DRAFT" });
    bundleIds.push(bundle.id);

    await expect(deactivateBundle(bundle.id)).rejects.toThrow(BundleNotActiveError);
  });

  it("throws for a nonexistent bundle id", async () => {
    await expect(deactivateBundle("00000000-0000-0000-0000-000000000000")).rejects.toThrow(BundleNotFoundError);
  });
});
