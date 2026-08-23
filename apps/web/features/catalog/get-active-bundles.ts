import "server-only";
import { type Bundle, bundles, db } from "@dirakitpro/database";
import { and, eq, gte, isNull, lte, or, sql } from "drizzle-orm";

/**
 * Active bundle campaign catalog (CAT-005). A bundle is discoverable here only
 * when `status = ACTIVE` AND `now` falls inside its campaign window. A null
 * `starts_at`/`ends_at` means that bound is unrestricted (10.3) — this only
 * governs whether the bundle is listed/purchasable now, not whether an Order
 * already created against it stays valid (that's COM-006, unrelated to this query).
 */
export async function getActiveBundles(): Promise<Bundle[]> {
  return db
    .select()
    .from(bundles)
    .where(
      and(
        eq(bundles.status, "ACTIVE"),
        or(isNull(bundles.startsAt), lte(bundles.startsAt, sql`now()`)),
        or(isNull(bundles.endsAt), gte(bundles.endsAt, sql`now()`)),
      ),
    );
}
