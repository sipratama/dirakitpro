import "server-only";
import { bundles, db, type Bundle } from "@dirakitpro/database";
import { and, eq, ne } from "drizzle-orm";
import type { BundleInput } from "./create-bundle";
import { BundleNotFoundError, BundleTypeLockedError, InvalidSlugFormatError, SelectionCountMustBeNullError, SelectionCountRequiredError, SlugConflictError } from "./errors";
import { isValidSlugFormat } from "./is-valid-slug-format";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertSelectionCountMatchesType(input: Pick<BundleInput, "type" | "selectionCount">): void {
  if (input.type === "CHOOSE_N" && (input.selectionCount === null || input.selectionCount < 1)) {
    throw new SelectionCountRequiredError();
  }
  if (input.type === "FIXED" && input.selectionCount !== null) {
    throw new SelectionCountMustBeNullError();
  }
}

/**
 * ADM-004 bundle edit. `type` is locked once the bundle has ever been ACTIVE
 * — inferred from `status !== "DRAFT"`, since 10.3's transition table only
 * reaches ACTIVE/INACTIVE/EXPIRED via having passed through ACTIVE at least
 * once. An Order may already reference this bundle under its original type's
 * semantics (COM-004 FIXED vs COM-005 CHOOSE_N selection rules), so silently
 * changing type afterward could desync historical orders from what the
 * bundle now means. A still-DRAFT bundle can freely change type.
 */
export async function updateBundle(bundleId: string, input: BundleInput): Promise<Bundle> {
  if (!UUID_PATTERN.test(bundleId)) throw new BundleNotFoundError();
  if (!isValidSlugFormat(input.slug)) throw new InvalidSlugFormatError();
  assertSelectionCountMatchesType(input);

  const [existing] = await db.select().from(bundles).where(eq(bundles.id, bundleId)).limit(1);
  if (!existing) throw new BundleNotFoundError();

  if (input.type !== existing.type && existing.status !== "DRAFT") {
    throw new BundleTypeLockedError();
  }

  const [slugTaken] = await db
    .select({ id: bundles.id })
    .from(bundles)
    .where(and(eq(bundles.slug, input.slug), ne(bundles.id, bundleId)))
    .limit(1);
  if (slugTaken) throw new SlugConflictError();

  const [updated] = await db
    .update(bundles)
    .set({
      slug: input.slug,
      title: input.title,
      description: input.description,
      type: input.type,
      selectionCount: input.selectionCount,
      price: input.price,
      currency: input.currency,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    })
    .where(eq(bundles.id, bundleId))
    .returning();
  return updated;
}
