import Link from "next/link";
import { getPendingModerationCount } from "@/features/admin/get-pending-moderation-count";

// ADMIN_CORE.md §2 — points at the actionable thing (pending moderation),
// not a general analytics page (PostHog covers that, PRD §13).
export default async function AdminDashboardPage() {
  const pendingCount = await getPendingModerationCount();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Admin</h1>

      <div className="mt-8 flex flex-col gap-4">
        <Link
          href="/admin/projects?status=UNREVIEWED"
          className="flex items-center justify-between rounded-card border border-neutral-100 bg-surface p-5 hover:border-brand-amber"
        >
          <span className="text-h3 text-brand-ink">Moderasi project</span>
          <span className="rounded-full bg-brand-amber-tint px-3 py-1 text-micro text-brand-amber-text">
            {pendingCount} menunggu
          </span>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-card border border-neutral-100 bg-surface p-5 text-h3 text-brand-ink hover:border-brand-amber"
        >
          Learner
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-card border border-neutral-100 bg-surface p-5 text-h3 text-brand-ink hover:border-brand-amber"
        >
          Orders
        </Link>
        <Link
          href="/admin/courses"
          className="rounded-card border border-neutral-100 bg-surface p-5 text-h3 text-brand-ink hover:border-brand-amber"
        >
          Course
        </Link>
        <Link
          href="/admin/bundles"
          className="rounded-card border border-neutral-100 bg-surface p-5 text-h3 text-brand-ink hover:border-brand-amber"
        >
          Bundle
        </Link>
      </div>
    </div>
  );
}
