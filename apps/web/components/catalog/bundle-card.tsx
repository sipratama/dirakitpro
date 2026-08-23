import Link from "next/link";
import type { Bundle } from "@dirakitpro/database";
import { formatPrice } from "@/lib/format-price";

// SCREEN_INVENTORY /bundles card content: title, type (FIXED shows included
// course count; CHOOSE_N shows "pilih N dari M course"), price. `courseCount`
// (M) isn't on the Bundle row itself — the caller resolves it via
// getBundleBySlug per bundle (bundle lists are campaign-driven and small,
// unlike the course catalog, so this doesn't reintroduce the N+1 concern
// CAT-006 warns about for courses).
export function BundleCard({ bundle, courseCount }: { bundle: Bundle; courseCount: number }) {
  const typeLabel =
    bundle.type === "FIXED"
      ? `${courseCount} course termasuk`
      : `Pilih ${bundle.selectionCount} dari ${courseCount} course`;

  return (
    <Link
      href={`/bundles/${bundle.slug}`}
      className="flex flex-col gap-3 rounded-card border border-neutral-100 bg-surface p-5 transition-colors hover:border-brand-amber"
    >
      <h3 className="text-h3 text-brand-ink">{bundle.title}</h3>
      <span className="text-small text-neutral-600">{typeLabel}</span>
      <span className="text-body font-medium text-brand-ink">{formatPrice(bundle.price)}</span>
    </Link>
  );
}
