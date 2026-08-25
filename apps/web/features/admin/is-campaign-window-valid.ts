import type { Bundle } from "@dirakitpro/database";

/**
 * 10.3: "ACTIVE tetap harus memenuhi campaign window starts_at <= now <=
 * ends_at jika kedua batas waktu dikonfigurasi." Used by both activateBundle
 * (first DRAFT -> ACTIVE) and reactivateBundle (INACTIVE -> ACTIVE) — the same
 * window rule governs entering ACTIVE either way. A null bound is
 * unrestricted, matching getActiveBundles/isBundlePurchasable in the catalog
 * module.
 */
export function isCampaignWindowValid(bundle: Pick<Bundle, "startsAt" | "endsAt">, now: Date = new Date()): boolean {
  if (bundle.startsAt && bundle.startsAt > now) return false;
  if (bundle.endsAt && bundle.endsAt < now) return false;
  return true;
}
