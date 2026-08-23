import { bundles, db, type NewBundle } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getActiveBundles } from "./get-active-bundles";

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
      price: "100000",
      status: "ACTIVE",
      ...overrides,
    })
    .returning();
  return bundle;
}

describe("getActiveBundles", () => {
  const bundleIds: string[] = [];

  afterEach(async () => {
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    bundleIds.length = 0;
  });

  it("includes an ACTIVE bundle with no campaign window bounds (10.3 — null is unrestricted)", async () => {
    const bundle = await insertBundle({ startsAt: null, endsAt: null });
    bundleIds.push(bundle.id);

    const result = await getActiveBundles();
    expect(result.map((b) => b.id)).toContain(bundle.id);
  });

  it("excludes a DRAFT bundle even if it would otherwise be within window", async () => {
    const bundle = await insertBundle({ status: "DRAFT" });
    bundleIds.push(bundle.id);

    const result = await getActiveBundles();
    expect(result.map((b) => b.id)).not.toContain(bundle.id);
  });

  it("excludes an ACTIVE bundle whose campaign window already ended", async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const bundle = await insertBundle({ endsAt: yesterday });
    bundleIds.push(bundle.id);

    const result = await getActiveBundles();
    expect(result.map((b) => b.id)).not.toContain(bundle.id);
  });

  it("excludes an ACTIVE bundle whose campaign window hasn't started yet", async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const bundle = await insertBundle({ startsAt: tomorrow });
    bundleIds.push(bundle.id);

    const result = await getActiveBundles();
    expect(result.map((b) => b.id)).not.toContain(bundle.id);
  });

  it("includes an ACTIVE bundle currently inside its campaign window", async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const bundle = await insertBundle({ startsAt: yesterday, endsAt: tomorrow });
    bundleIds.push(bundle.id);

    const result = await getActiveBundles();
    expect(result.map((b) => b.id)).toContain(bundle.id);
  });
});
