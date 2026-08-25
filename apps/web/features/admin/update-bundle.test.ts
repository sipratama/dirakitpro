import { bundles, db, type NewBundle } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import type { BundleInput } from "./create-bundle";
import { BundleNotFoundError, BundleTypeLockedError, SelectionCountRequiredError, SlugConflictError } from "./errors";
import { updateBundle } from "./update-bundle";

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

function inputFrom(bundle: { slug: string; title: string; description: string; type: "FIXED" | "CHOOSE_N"; selectionCount: number | null }, overrides: Partial<BundleInput> = {}): BundleInput {
  return {
    slug: bundle.slug,
    title: bundle.title,
    description: bundle.description,
    type: bundle.type,
    selectionCount: bundle.selectionCount,
    price: "299000",
    currency: "IDR",
    startsAt: null,
    endsAt: null,
    ...overrides,
  };
}

describe("updateBundle", () => {
  const bundleIds: string[] = [];

  afterEach(async () => {
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    bundleIds.length = 0;
  });

  it("updates fields on a DRAFT bundle, including changing type freely", async () => {
    const bundle = await insertBundle({ status: "DRAFT", type: "FIXED", selectionCount: null });
    bundleIds.push(bundle.id);

    const updated = await updateBundle(bundle.id, inputFrom(bundle, { title: "New Title", type: "CHOOSE_N", selectionCount: 2 }));

    expect(updated.title).toBe("New Title");
    expect(updated.type).toBe("CHOOSE_N");
    expect(updated.selectionCount).toBe(2);
  });

  it("throws for a nonexistent bundle id", async () => {
    await expect(
      updateBundle("00000000-0000-0000-0000-000000000000", {
        slug: uniqueSlug("x"),
        title: "x",
        description: "x",
        type: "FIXED",
        selectionCount: null,
        price: "0",
        currency: "IDR",
        startsAt: null,
        endsAt: null,
      }),
    ).rejects.toThrow(BundleNotFoundError);
  });

  it("rejects CHOOSE_N without a selectionCount", async () => {
    const bundle = await insertBundle();
    bundleIds.push(bundle.id);

    await expect(updateBundle(bundle.id, inputFrom(bundle, { type: "CHOOSE_N", selectionCount: null }))).rejects.toThrow(
      SelectionCountRequiredError,
    );
  });

  it("rejects a slug already used by a different bundle", async () => {
    const bundleA = await insertBundle();
    const bundleB = await insertBundle();
    bundleIds.push(bundleA.id, bundleB.id);

    await expect(updateBundle(bundleB.id, inputFrom(bundleB, { slug: bundleA.slug }))).rejects.toThrow(SlugConflictError);
  });

  it("locks type once the bundle has ever been ACTIVE (status inferred non-DRAFT)", async () => {
    const bundle = await insertBundle({ status: "INACTIVE", type: "FIXED", selectionCount: null });
    bundleIds.push(bundle.id);

    await expect(updateBundle(bundle.id, inputFrom(bundle, { type: "CHOOSE_N", selectionCount: 2 }))).rejects.toThrow(
      BundleTypeLockedError,
    );
  });

  it("allows updating other fields on a non-DRAFT bundle as long as type is unchanged", async () => {
    const bundle = await insertBundle({ status: "INACTIVE", type: "FIXED", selectionCount: null });
    bundleIds.push(bundle.id);

    const updated = await updateBundle(bundle.id, inputFrom(bundle, { title: "Renamed" }));
    expect(updated.title).toBe("Renamed");
  });
});
