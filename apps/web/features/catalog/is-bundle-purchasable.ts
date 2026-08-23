import type { Bundle } from "@dirakitpro/database";

/**
 * Bundle-level purchasability (10.3): `ACTIVE` alone isn't sufficient — the
 * campaign window, when configured, must currently hold too. Mirrors the same
 * window check `getActiveBundles()` applies at the listing level, but for a
 * single already-fetched bundle (e.g. the detail page, which must still
 * render an INACTIVE/EXPIRED bundle to explain why it isn't purchasable
 * rather than treat it as not found).
 */
export function isBundlePurchasable(
  bundle: Pick<Bundle, "status" | "startsAt" | "endsAt">,
  now: Date = new Date(),
): boolean {
  if (bundle.status !== "ACTIVE") return false;
  if (bundle.startsAt && bundle.startsAt > now) return false;
  if (bundle.endsAt && bundle.endsAt < now) return false;
  return true;
}
