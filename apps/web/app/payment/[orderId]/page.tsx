import { getCurrentUser } from "@dirakitpro/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getOrderForOwner } from "@/features/commerce/get-order-for-owner";
import { formatPrice } from "@/lib/format-price";

export default async function PaymentStatusPage({ params }: PageProps<"/payment/[orderId]">) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Ownership check (16): a nonexistent order and someone else's order both
  // 404 the same way — never reveal that an order exists to a non-owner.
  const order = await getOrderForOwner(orderId, user.id);
  if (!order) notFound();

  const backHref = order.sourceSlug
    ? order.sourceType === "DIRECT_COURSE"
      ? `/courses/${order.sourceSlug}`
      : `/bundles/${order.sourceSlug}`
    : null;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Status pembayaran</h1>
      <p className="mt-2 text-body text-neutral-600">{formatPrice(order.totalAmount)}</p>

      {order.status === "PENDING" && (
        <div className="mt-6 rounded-card bg-warning-bg px-4 py-3 text-body text-warning-text">
          Pembayaran kamu sedang diproses. Halaman ini akan menunjukkan status terbaru begitu pembayaran
          terkonfirmasi — sampai di halaman ini belum berarti pembayaran sudah berhasil.
        </div>
      )}

      {order.status === "PAID" && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="rounded-card bg-success-bg px-4 py-3 text-body text-success-text">
            Pembayaran berhasil! Course berikut sudah aktif di akunmu:
          </div>
          <ul className="flex flex-col gap-2">
            {order.grantedCourses.map((course) => (
              <li
                key={course.courseId}
                className="rounded-card border border-neutral-100 bg-surface p-4 text-body text-brand-ink"
              >
                {course.title}
              </li>
            ))}
          </ul>
          <Button render={<Link href="/dashboard" />}>Ke dashboard</Button>
        </div>
      )}

      {(order.status === "EXPIRED" || order.status === "CANCELLED") && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="rounded-card bg-danger-bg px-4 py-3 text-body text-danger-text">
            {order.status === "EXPIRED"
              ? "Waktu pembayaran untuk order ini sudah habis."
              : "Order ini sudah dibatalkan."}
          </div>
          {backHref && <Button render={<Link href={backHref} />}>Coba lagi</Button>}
        </div>
      )}

      {order.status === "REFUNDED" && (
        <div className="mt-6 rounded-card bg-neutral-100/40 px-4 py-3 text-body text-neutral-600">
          Order ini sudah di-refund.
        </div>
      )}
    </div>
  );
}
