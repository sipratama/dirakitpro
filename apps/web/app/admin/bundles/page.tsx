import Link from "next/link";
import { getBundlesForAdmin } from "@/features/admin/get-bundles-for-admin";
import { formatPrice } from "@/lib/format-price";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  EXPIRED: "Expired",
};

// ADM-004 — every bundle across every status, with a link into each edit form.
export default async function AdminBundlesPage() {
  const bundleList = await getBundlesForAdmin();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-brand-ink">Bundle</h1>
        <Link href="/admin/bundles/new" className="text-body text-brand-ink underline">
          + Bundle baru
        </Link>
      </div>

      {bundleList.length === 0 ? (
        <p className="mt-6 text-body text-neutral-600">Belum ada bundle.</p>
      ) : (
        <table className="mt-8 w-full text-body text-brand-ink">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-small text-neutral-600">
              <th className="py-2">Judul</th>
              <th className="py-2">Type</th>
              <th className="py-2">Status</th>
              <th className="py-2">Harga</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {bundleList.map((bundle) => (
              <tr key={bundle.id} className="border-b border-neutral-100">
                <td className="py-2">{bundle.title}</td>
                <td className="py-2">{bundle.type}</td>
                <td className="py-2">{STATUS_LABEL[bundle.status] ?? bundle.status}</td>
                <td className="py-2">{formatPrice(bundle.price)}</td>
                <td className="py-2">
                  <Link href={`/admin/bundles/${bundle.id}`} className="text-brand-ink underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
