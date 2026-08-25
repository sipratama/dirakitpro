import "server-only";
import { bundles, db, type Bundle } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { InvalidSlugFormatError, SelectionCountMustBeNullError, SelectionCountRequiredError, SlugConflictError } from "./errors";
import { isValidSlugFormat } from "./is-valid-slug-format";

export type BundleInput = {
  slug: string;
  title: string;
  description: string;
  type: "FIXED" | "CHOOSE_N";
  selectionCount: number | null;
  price: string;
  currency: string;
  startsAt: Date | null;
  endsAt: Date | null;
};

function assertSelectionCountMatchesType(input: Pick<BundleInput, "type" | "selectionCount">): void {
  if (input.type === "CHOOSE_N" && (input.selectionCount === null || input.selectionCount < 1)) {
    throw new SelectionCountRequiredError();
  }
  if (input.type === "FIXED" && input.selectionCount !== null) {
    throw new SelectionCountMustBeNullError();
  }
}

/** ADM-004 bundle creation. selectionCount's presence/absence is validated against `type` here at the function level (COM-005), not only left to schema-level nullability. */
export async function createBundle(input: BundleInput): Promise<Bundle> {
  if (!isValidSlugFormat(input.slug)) throw new InvalidSlugFormatError();
  assertSelectionCountMatchesType(input);

  const [existing] = await db.select({ id: bundles.id }).from(bundles).where(eq(bundles.slug, input.slug)).limit(1);
  if (existing) throw new SlugConflictError();

  const [created] = await db
    .insert(bundles)
    .values({
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
    .returning();
  return created;
}
