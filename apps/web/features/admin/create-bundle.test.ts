import { bundles, db } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createBundle, type BundleInput } from "./create-bundle";
import { InvalidSlugFormatError, SelectionCountMustBeNullError, SelectionCountRequiredError, SlugConflictError } from "./errors";

function uniqueSlug(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function baseInput(overrides: Partial<BundleInput> = {}): BundleInput {
  return {
    slug: uniqueSlug("test-bundle"),
    title: "Test Bundle",
    description: "Description",
    type: "FIXED",
    selectionCount: null,
    price: "299000",
    currency: "IDR",
    startsAt: null,
    endsAt: null,
    ...overrides,
  };
}

describe("createBundle", () => {
  const bundleIds: string[] = [];

  afterEach(async () => {
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    bundleIds.length = 0;
  });

  it("creates a FIXED bundle as DRAFT with no selectionCount", async () => {
    const created = await createBundle(baseInput());
    bundleIds.push(created.id);

    expect(created.status).toBe("DRAFT");
    expect(created.selectionCount).toBeNull();
    expect(created.price).toBe("299000.00");
  });

  it("creates a CHOOSE_N bundle with a selectionCount", async () => {
    const created = await createBundle(baseInput({ type: "CHOOSE_N", selectionCount: 2 }));
    bundleIds.push(created.id);

    expect(created.type).toBe("CHOOSE_N");
    expect(created.selectionCount).toBe(2);
  });

  it("rejects CHOOSE_N without a selectionCount", async () => {
    await expect(createBundle(baseInput({ type: "CHOOSE_N", selectionCount: null }))).rejects.toThrow(
      SelectionCountRequiredError,
    );
  });

  it("rejects FIXED with a selectionCount set", async () => {
    await expect(createBundle(baseInput({ type: "FIXED", selectionCount: 2 }))).rejects.toThrow(
      SelectionCountMustBeNullError,
    );
  });

  it("rejects an invalid slug format", async () => {
    await expect(createBundle(baseInput({ slug: "Not Valid!" }))).rejects.toThrow(InvalidSlugFormatError);
  });

  it("rejects a slug that's already taken", async () => {
    const slug = uniqueSlug("dup");
    const first = await createBundle(baseInput({ slug }));
    bundleIds.push(first.id);

    await expect(createBundle(baseInput({ slug }))).rejects.toThrow(SlugConflictError);
  });
});
