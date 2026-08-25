import Link from "next/link";
import { getCoursesForAdmin } from "@/features/admin/get-courses-for-admin";
import { formatPrice } from "@/lib/format-price";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  UNPUBLISHED: "Unpublished",
};

// ADM-002 — every course across every status, with a link into each edit form.
export default async function AdminCoursesPage() {
  const courseList = await getCoursesForAdmin();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-brand-ink">Course</h1>
        <Link href="/admin/courses/new" className="text-body text-brand-ink underline">
          + Course baru
        </Link>
      </div>

      {courseList.length === 0 ? (
        <p className="mt-6 text-body text-neutral-600">Belum ada course.</p>
      ) : (
        <table className="mt-8 w-full text-body text-brand-ink">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-small text-neutral-600">
              <th className="py-2">Judul</th>
              <th className="py-2">Slug</th>
              <th className="py-2">Status</th>
              <th className="py-2">Harga</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {courseList.map((course) => (
              <tr key={course.id} className="border-b border-neutral-100">
                <td className="py-2">{course.title}</td>
                <td className="py-2">{course.slug}</td>
                <td className="py-2">{STATUS_LABEL[course.status] ?? course.status}</td>
                <td className="py-2">{formatPrice(course.price)}</td>
                <td className="py-2">
                  <Link href={`/admin/courses/${course.id}`} className="text-brand-ink underline">
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
