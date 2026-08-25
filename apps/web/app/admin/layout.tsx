import { requireAdmin } from "@dirakitpro/auth";
import { notFound } from "next/navigation";

// ADMIN_CORE.md §1 (ADM-001) — the single guard shared by every /admin page.
// Authenticated-but-not-ADMIN must not learn this route exists, so a
// rejection is notFound(), never a 403 that confirms it's real.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch {
    notFound();
  }

  return <>{children}</>;
}
