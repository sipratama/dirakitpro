import Link from "next/link";
import type { User } from "@dirakitpro/database";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/courses", label: "Course" },
  { href: "/bundles", label: "Bundle" },
  { href: "/projects", label: "Showcase" },
] as const;

// No shared site-wide header exists yet (app/layout.tsx renders no chrome) —
// this is Homepage-local and intentionally not wired into the root layout,
// so it never affects any other route. `user` is fetched once by the page
// (app/page.tsx) and passed down, matching this codebase's convention of
// keeping data-fetching in the async page and children synchronous/testable
// (see app/dashboard/page.tsx).
export function PublicHeader({ user }: { user: User | null }) {
  return (
    <header className="border-b border-neutral-100 bg-brand-cream">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="text-h3 text-brand-ink">
            DirakitPro
          </Link>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-6 text-body text-neutral-600 md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-brand-ink">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Button size="sm" nativeButton={false} render={<Link href="/dashboard" />}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
                  Masuk
                </Button>
                <Button size="sm" nativeButton={false} render={<Link href="/register" />}>
                  Daftar
                </Button>
              </>
            )}
          </div>
        </div>

        <nav
          aria-label="Navigasi utama mobile"
          className="flex items-center justify-center gap-6 border-t border-neutral-100 py-3 text-small text-neutral-600 md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-brand-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
