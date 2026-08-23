import { getCurrentUser } from "@dirakitpro/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SnapCheckout } from "@/components/commerce/snap-checkout";
import { getBundleBySlug } from "@/features/catalog/get-bundle-by-slug";
import { createBundleOrder } from "@/features/commerce/create-bundle-order";
import { createSnapToken } from "@/features/commerce/create-snap-token";
import { BundleNotPurchasableError, BundleSelectionError } from "@/features/commerce/errors";
import { formatPrice } from "@/lib/format-price";
import { cancelMismatchedOrderAction } from "./actions";

export default async function BundleCheckoutPage({ params, searchParams }: PageProps<"/checkout/bundle/[bundleSlug]">) {
  const { bundleSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const coursesParam = resolvedSearchParams.courses;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const selectedCourseIds =
    typeof coursesParam === "string" && coursesParam.length > 0 ? coursesParam.split(",") : undefined;

  let result;
  try {
    result = await createBundleOrder(user.id, bundleSlug, selectedCourseIds);
  } catch (error) {
    if (error instanceof BundleNotPurchasableError || error instanceof BundleSelectionError) {
      return (
        <div className="mx-auto w-full max-w-lg px-4 py-12">
          <h1 className="text-h1 text-brand-ink">Checkout tidak bisa dilanjutkan</h1>
          <div className="mt-6 rounded-card bg-danger-bg px-4 py-3 text-body text-danger-text">{error.message}</div>
          <Button render={<Link href={`/bundles/${bundleSlug}`} />} className="mt-6">
            Kembali ke halaman bundle
          </Button>
        </div>
      );
    }
    throw error;
  }

  if (result.kind === "existing_order_selection_mismatch") {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-12">
        <h1 className="text-h1 text-brand-ink">Ada pilihan course yang belum dibayar</h1>
        <p className="mt-4 text-body text-neutral-600">
          Kamu punya order bundle ini yang belum selesai dibayar dengan pilihan course yang berbeda. Batalkan order
          itu dulu untuk memilih ulang.
        </p>
        <form action={cancelMismatchedOrderAction.bind(null, result.existingOrder.id, bundleSlug)} className="mt-6">
          <Button type="submit" variant="outline">
            Batalkan &amp; pilih ulang
          </Button>
        </form>
      </div>
    );
  }

  const bundle = await getBundleBySlug(bundleSlug, user.id);
  if (!bundle) notFound();

  const token = await createSnapToken(result.order.id);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Checkout</h1>

      <div className="mt-6 rounded-card border border-neutral-100 bg-surface p-5">
        <p className="text-h3 text-brand-ink">{bundle.title}</p>
        <p className="mt-4 text-h2 text-brand-ink">{formatPrice(bundle.price)}</p>
      </div>

      <div className="mt-8">
        <SnapCheckout
          token={token}
          orderId={result.order.id}
          clientKey={process.env.MIDTRANS_CLIENT_KEY ?? ""}
          isProduction={process.env.MIDTRANS_IS_PRODUCTION === "true"}
        />
      </div>
    </div>
  );
}
