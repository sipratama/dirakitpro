import { bundles, db, type NewBundle } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
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

describe("activateBundle", () => {
  const bundleIds: string[] = [];

  afterEach(async () => {
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    bundleIds.length = 0;
  });

  it("activates a DRAFT bundle with no campaign window configured", async () => {
    const bundle = await insertBundle();
    bundleIds.push(bundle.id);

    const activated = await activateBundle(bundle.id);
    expect(activated.status).toBe("ACTIVE");
  });

  it("activates a DRAFT bundle currently within its campaign window", async () => {
    const bundle = await insertBundle({ startsAt: new Date("2000-01-01T00:00:00Z"), endsAt: new Date("2999-01-01T00:00:00Z") });
    bundleIds.push(bundle.id);

    const activated = await activateBundle(bundle.id);
    expect(activated.status).toBe("ACTIVE");
  });

  it("rejects activating a DRAFT bundle whose campaign window has already lapsed", async () => {
    const bundle = await insertBundle({ endsAt: new Date("2000-01-01T00:00:00Z") });
    bundleIds.push(bundle.id);

    await expect(activateBundle(bundle.id)).rejects.toThrow(BundleCampaignWindowExpiredError);
  });

  it("rejects activating a bundle that isn't DRAFT", async () => {
    const bundle = await insertBundle({ status: "INACTIVE" });
    bundleIds.push(bundle.id);

    await expect(activateBundle(bundle.id)).rejects.toThrow(BundleNotDraftError);
  });

  it("throws for a nonexistent bundle id", async () => {
    await expect(activateBundle("00000000-0000-0000-0000-000000000000")).rejects.toThrow(BundleNotFoundError);
  });
});
