import { bundles, db, type NewBundle } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getBundlesForAdmin } from "./get-bundles-for-admin";

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
      ...overrides,
    })
    .returning();
  return bundle;
}

describe("getBundlesForAdmin", () => {
  const bundleIds: string[] = [];

  afterEach(async () => {
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    bundleIds.length = 0;
  });

  it("includes bundles of every status, not just ACTIVE", async () => {
    const draft = await insertBundle({ status: "DRAFT" });
    const inactive = await insertBundle({ status: "INACTIVE" });
    bundleIds.push(draft.id, inactive.id);

    const result = await getBundlesForAdmin();

    expect(result.find((b) => b.id === draft.id)?.status).toBe("DRAFT");
    expect(result.find((b) => b.id === inactive.id)?.status).toBe("INACTIVE");
  });

  it("self-heals a stored ACTIVE bundle whose campaign window has already lapsed to EXPIRED", async () => {
    const lapsed = await insertBundle({
      status: "ACTIVE",
      endsAt: new Date("2000-01-01T00:00:00Z"),
    });
    bundleIds.push(lapsed.id);

    const result = await getBundlesForAdmin();

    expect(result.find((b) => b.id === lapsed.id)?.status).toBe("EXPIRED");

    const [reloaded] = await db.select().from(bundles).where(inArray(bundles.id, [lapsed.id]));
    expect(reloaded.status).toBe("EXPIRED");
  });

  it("leaves an ACTIVE bundle still within its window untouched", async () => {
    const active = await insertBundle({ status: "ACTIVE", endsAt: new Date("2999-01-01T00:00:00Z") });
    bundleIds.push(active.id);

    const result = await getBundlesForAdmin();

    expect(result.find((b) => b.id === active.id)?.status).toBe("ACTIVE");
  });
});
