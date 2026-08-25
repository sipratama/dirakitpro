import Link from "next/link";
import type { User } from "@dirakitpro/database";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/bundles", label: "Bundles" },
  { href: "/projects", label: "Hasil Rakitan" },
] as const;

// No shared site-wide header exists yet (app/layout.tsx renders no chrome) —
// this is Homepage-local and intentionally not wired into the root layout,
// so it never affects any other route. `user` is fetched once by the page
// (app/page.tsx) and passed down, matching this codebase's convention of
// keeping data-fetching in the async page and children synchronous/testable
// (see app/dashboard/page.tsx). Visual language is DESIGN.md 8 (Memphis
// Digital Workshop) — scoped to this component only, not the shared palette.
export function PublicHeader({ user }: { user: User | null }) {
  return (
    <header className="border-b-2 border-brand-ink bg-brand-cream font-body-memphis">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-display-memphis text-xl font-extrabold text-brand-ink">DirakitPro</span>
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-8 text-[15px] font-medium text-brand-ink md:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-opacity hover:opacity-70">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href="/dashboard" />}
                className="rounded-control border-2 border-brand-ink bg-brand-amber px-4 font-bold text-brand-ink shadow-hard-sm transition-transform duration-150 ease-out hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/login" />}
                  className="text-brand-ink hover:bg-brand-ink/5"
                >
                  Masuk
                </Button>
                <Button
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/register" />}
                  className="rounded-control border-2 border-brand-ink bg-brand-amber px-4 font-bold text-brand-ink shadow-hard-sm transition-transform duration-150 ease-out hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1"
                >
                  Mulai Merakit
                </Button>
              </>
            )}
          </div>
        </div>

        <nav
          aria-label="Navigasi utama mobile"
          className="flex items-center justify-center gap-6 border-t-2 border-brand-ink py-3 text-sm font-medium text-brand-ink md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-opacity hover:opacity-70">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

// A simple assembly-inspired geometric glyph — three flat pieces about to
// click together, not a wordmark stand-in — aria-hidden so the brand link's
// accessible name stays exactly "DirakitPro".
function BrandMark() {
  return (
    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="14" width="11" height="11" rx="2" strokeWidth="2" className="fill-brand-teal stroke-brand-ink" />
      <rect
        x="15"
        y="2"
        width="11"
        height="11"
        rx="2"
        strokeWidth="2"
        transform="rotate(8 20.5 7.5)"
        className="fill-brand-amber stroke-brand-ink"
      />
      <circle cx="8" cy="8" r="5.5" strokeWidth="2" className="fill-brand-amber stroke-brand-ink" />
    </svg>
  );
}
