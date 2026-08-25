import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getBundleForAdmin } from "@/features/admin/get-bundle-for-admin";
import { getPublishedCourses } from "@/features/catalog/get-published-courses";
import { BundleFormFields } from "../bundle-form-fields";
import {
  activateBundleAction,
  deactivateBundleAction,
  reactivateBundleAction,
  setBundleEligibleCoursesAction,
  updateBundleAction,
} from "./actions";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  EXPIRED: "Expired",
};

function toDatetimeLocalValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 16);
}

export default async function AdminBundleDetailPage({
  params,
  searchParams,
}: PageProps<"/admin/bundles/[bundleId]">) {
  const { bundleId } = await params;
  const resolvedSearchParams = await searchParams;
  const bundle = await getBundleForAdmin(bundleId);
  if (!bundle) notFound();

  const publishedCourses = await getPublishedCourses();
  const eligibleCourseIds = new Set(bundle.eligibleCourses.map((course) => course.id));
  const warning = typeof resolvedSearchParams.warning === "string" ? resolvedSearchParams.warning : null;

  const saveAction = updateBundleAction.bind(null, bundleId);
  const eligibleAction = setBundleEligibleCoursesAction.bind(null, bundleId);
  const activateAction = activateBundleAction.bind(null, bundleId);
  const deactivateAction = deactivateBundleAction.bind(null, bundleId);
  const reactivateAction = reactivateBundleAction.bind(null, bundleId);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-brand-ink">{bundle.title}</h1>
        <span className="text-small text-neutral-600">{STATUS_LABEL[bundle.status]}</span>
      </div>

      {warning && (
        <p className="mt-4 rounded-control bg-warning-bg px-3 py-2 text-small text-warning-text">{warning}</p>
      )}

      <form action={saveAction} className="mt-8 flex flex-col gap-5">
        <BundleFormFields
          defaults={{
            slug: bundle.slug,
            title: bundle.title,
            description: bundle.description,
            type: bundle.type,
            selectionCount: bundle.selectionCount?.toString() ?? "",
            price: bundle.price,
            currency: bundle.currency,
            startsAt: toDatetimeLocalValue(bundle.startsAt),
            endsAt: toDatetimeLocalValue(bundle.endsAt),
          }}
          typeLocked={bundle.status !== "DRAFT"}
        />
        <Button type="submit">Simpan</Button>
      </form>

      <div className="mt-10 border-t border-neutral-100 pt-6">
        <h2 className="text-h3 text-brand-ink">Eligible courses</h2>
        <p className="mt-1 text-small text-neutral-600">
          Course PUBLISHED yang eligible/included untuk bundle ini.
        </p>
        <form action={eligibleAction} className="mt-4 flex flex-col gap-2">
          {publishedCourses.length === 0 ? (
            <p className="text-body text-neutral-600">Belum ada course PUBLISHED.</p>
          ) : (
            publishedCourses.map((course) => (
              <label key={course.id} className="flex items-center gap-2 text-body text-brand-ink">
                <input
                  type="checkbox"
                  name="courseIds"
                  value={course.id}
                  defaultChecked={eligibleCourseIds.has(course.id)}
                  className="h-4 w-4 rounded border-neutral-300 text-brand-teal focus:ring-brand-teal"
                />
                {course.title}
              </label>
            ))
          )}
          <Button type="submit" variant="outline" className="mt-2 self-start">
            Simpan eligible courses
          </Button>
        </form>
      </div>

      <div className="mt-10 border-t border-neutral-100 pt-6">
        <h2 className="text-h3 text-brand-ink">Campaign status</h2>
        {bundle.status === "DRAFT" && (
          <form action={activateAction} className="mt-4">
            <Button type="submit">Activate</Button>
          </form>
        )}
        {bundle.status === "ACTIVE" && (
          <form action={deactivateAction} className="mt-4">
            <Button type="submit" variant="outline">
              Deactivate
            </Button>
          </form>
        )}
        {bundle.status === "INACTIVE" && (
          <form action={reactivateAction} className="mt-4">
            <Button type="submit">Reactivate</Button>
          </form>
        )}
        {bundle.status === "EXPIRED" && (
          <p className="mt-4 text-body text-neutral-600">Bundle ini sudah expired dan tidak bisa direaktivasi.</p>
        )}
      </div>
    </div>
  );
}
