import { getCurrentUser } from "@dirakitpro/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getBundleBySlug } from "@/features/catalog/get-bundle-by-slug";
import { getBundleEligibleCount } from "@/features/catalog/get-bundle-eligibility";
import { isBundlePurchasable } from "@/features/catalog/is-bundle-purchasable";
import { formatPrice } from "@/lib/format-price";
import { BundleCourseSelector } from "./bundle-course-selector";

export default async function BundleDetailPage({ params }: PageProps<"/bundles/[slug]">) {
  const { slug } = await params;
  const user = await getCurrentUser();

  // Unlike a course, a bundle that exists but isn't ACTIVE/in-window still
  // renders (SCREEN_INVENTORY) — only a genuinely nonexistent slug 404s.
  const bundle = await getBundleBySlug(slug, user?.id);
  if (!bundle) notFound();

  const purchasable = isBundlePurchasable(bundle);

  // 10.8: a learner can already own so many eligible courses that fewer than
  // `selectionCount` remain unowned — a per-learner state, distinct from the
  // bundle-level ACTIVE/window check above. Guests have no ownership history,
  // so this only applies to a signed-in learner.
  const eligibleCount =
    bundle.type === "CHOOSE_N" && user ? await getBundleEligibleCount(bundle.id, user.id) : null;
  const learnerShortOfEligible =
    bundle.type === "CHOOSE_N" && eligibleCount !== null && eligibleCount < (bundle.selectionCount ?? 0);

  const checkoutHref = `/checkout/bundle/${bundle.slug}`;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <section className="flex flex-col gap-3">
        <h1 className="text-h1 text-brand-ink">{bundle.title}</h1>
        <p className="text-body-lg text-neutral-600">{bundle.description}</p>
        <span className="text-h2 text-brand-ink">{formatPrice(bundle.price)}</span>
      </section>

      {!purchasable && (
        <div className="mt-6 rounded-card bg-warning-bg px-4 py-3 text-body text-warning-text">
          Bundle ini sedang tidak aktif atau di luar periode campaign, jadi belum bisa dibeli saat ini.
        </div>
      )}

      {purchasable && learnerShortOfEligible && (
        <div className="mt-6 rounded-card bg-warning-bg px-4 py-3 text-body text-warning-text">
          Kamu sudah memiliki sebagian besar course eligible di bundle ini, jadi tidak tersisa cukup course
          untuk memenuhi syarat pilih {bundle.selectionCount} course.
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-h2 text-brand-ink">Course dalam bundle ini</h2>

        {bundle.type === "FIXED" ? (
          <ul className="mt-4 flex flex-col gap-3">
            {bundle.courses.map((course) => (
              <li key={course.id} className="rounded-card border border-neutral-100 bg-surface p-4">
                <p className="text-h3 text-brand-ink">{course.title}</p>
                <p className="mt-1 text-body text-neutral-600">{course.outcomeDescription}</p>
                {course.alreadyOwned && (
                  <span className="mt-2 inline-block rounded-full bg-success-bg px-3 py-1 text-micro text-success-text">
                    Sudah dimiliki
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <BundleCourseSelector
            courses={bundle.courses}
            selectionCount={bundle.selectionCount ?? 0}
            checkoutDisabled={!purchasable || learnerShortOfEligible}
            checkoutHref={checkoutHref}
          />
        )}
      </section>

      {bundle.type === "FIXED" && (
        <div className="mt-10 border-t border-neutral-100 pt-8">
          {purchasable ? (
            <Button render={<Link href={checkoutHref} />}>Beli bundle ini</Button>
          ) : (
            <Button disabled>Beli bundle ini</Button>
          )}
        </div>
      )}
    </div>
  );
}
