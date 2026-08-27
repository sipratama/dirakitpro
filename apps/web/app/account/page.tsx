import { getCurrentUser } from "@dirakitpro/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/home/public-header";
import { PublicFooter } from "@/components/home/public-footer";
import { SignOutButton } from "@/components/home/sign-out-button";
import { Button } from "@/components/ui/button";

// SCREEN_INVENTORY.md "Cross-cutting / Global Navigation" (`/account`), IAM-002.
// proxy.ts already gates this route via clerkMiddleware's PROTECTED_PREFIXES —
// the check below is page-level defense in depth, matching app/dashboard/page.tsx
// and app/account/orders/page.tsx's established redirect-to-/login pattern.
export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      {await PublicHeader({ user })}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-h1 text-brand-ink">Akun saya</h1>

        <div className="mt-8 flex flex-col gap-4 rounded-card border border-neutral-100 bg-surface p-6">
          <div>
            <p className="text-small text-neutral-600">Email</p>
            <p className="text-body text-brand-ink">{user.email}</p>
          </div>
          <div>
            <p className="text-small text-neutral-600">Username</p>
            <p className="text-body text-brand-ink">{user.username}</p>
          </div>
          <div>
            <p className="text-small text-neutral-600">Role</p>
            <p className="text-body text-brand-ink">{user.role}</p>
          </div>
          <div>
            <p className="text-small text-neutral-600">Bergabung</p>
            <p className="text-body text-brand-ink">{new Date(user.createdAt).toLocaleDateString("id-ID")}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="outline" nativeButton={false} render={<Link href="/account/orders" />}>
            Riwayat pembelian
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/projects/me" />}>
            Rakitanku
          </Button>
          <SignOutButton />
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
