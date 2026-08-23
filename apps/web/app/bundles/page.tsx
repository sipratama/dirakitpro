import { BundleCard } from "@/components/catalog/bundle-card";
import { getActiveBundles } from "@/features/catalog/get-active-bundles";
import { getBundleBySlug } from "@/features/catalog/get-bundle-by-slug";

// This page calls no dynamic API (no auth, no cookies), so Next would
// otherwise prerender it statically at build time — freezing which bundles
// look ACTIVE-and-in-window. CAT-005 requires every currently-ACTIVE bundle to
// be discoverable here, so it must be evaluated per request instead.
export const dynamic = "force-dynamic";

export default async function BundlesPage() {
  const bundles = await getActiveBundles();
  const details = await Promise.all(bundles.map((bundle) => getBundleBySlug(bundle.slug)));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Bundle</h1>

      {bundles.length === 0 ? (
        // SCREEN_INVENTORY /bundles empty state: no ACTIVE campaign right now
        // is a normal, expected state (bundles are campaign-driven, not
        // always-on) — not an error.
        <p className="mt-10 text-body text-neutral-600">
          Belum ada campaign bundle yang aktif saat ini. Cek lagi nanti.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle, index) => (
            <BundleCard key={bundle.id} bundle={bundle} courseCount={details[index]?.courses.length ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
