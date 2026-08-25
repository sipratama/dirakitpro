import { getOrdersForAdmin } from "@/features/admin/get-orders-for-admin";
import { formatPrice } from "@/lib/format-price";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu pembayaran",
  PAID: "Berhasil",
  EXPIRED: "Kadaluarsa",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Di-refund",
};

// ADMIN_CORE.md §4 (ADM-006) — read-only, no manual action (open item, not built here).
export default async function AdminOrdersPage() {
  const orderList = await getOrdersForAdmin();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Orders</h1>

      {orderList.length === 0 ? (
        <p className="mt-6 text-body text-neutral-600">Belum ada order.</p>
      ) : (
        <table className="mt-8 w-full text-body text-brand-ink">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-small text-neutral-600">
              <th className="py-2">User</th>
              <th className="py-2">Item</th>
              <th className="py-2">Nominal</th>
              <th className="py-2">Status</th>
              <th className="py-2">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {orderList.map((order) => (
              <tr key={order.id} className="border-b border-neutral-100">
                <td className="py-2">{order.userEmail}</td>
                <td className="py-2">{order.itemTitle}</td>
                <td className="py-2">{formatPrice(order.totalAmount)}</td>
                <td className="py-2">{STATUS_LABEL[order.status] ?? order.status}</td>
                <td className="py-2">{new Date(order.createdAt).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
