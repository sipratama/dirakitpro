import { getCurrentUser } from "@dirakitpro/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrdersForUser } from "@/features/commerce/get-orders-for-user";
import { formatPrice } from "@/lib/format-price";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu pembayaran",
  PAID: "Berhasil",
  EXPIRED: "Kadaluarsa",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Di-refund",
};

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orderList = await getOrdersForUser(user.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Riwayat pembelian</h1>

      {orderList.length === 0 ? (
        <p className="mt-6 text-body text-neutral-600">Kamu belum melakukan pembelian apa pun.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {orderList.map((order) => (
            <li key={order.id}>
              <Link
                href={`/payment/${order.id}`}
                className="block rounded-card border border-neutral-100 bg-surface p-5 hover:border-brand-amber"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-h3 text-brand-ink">{order.itemTitle}</p>
                  <span className="text-body text-neutral-600">{formatPrice(order.totalAmount)}</span>
                </div>
                <p className="mt-1 text-small text-neutral-600">{STATUS_LABEL[order.status] ?? order.status}</p>
                {order.grantedCourseTitles.length > 0 && (
                  <p className="mt-2 text-small text-neutral-600">Course: {order.grantedCourseTitles.join(", ")}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
