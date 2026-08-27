import Link from "next/link";
import { cache } from "react";
import { Package } from "lucide-react";
import type { Bundle, User } from "@dirakitpro/database";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/home/account-menu";
import { getActiveBundles } from "@/features/catalog/get-active-bundles";

const NAV_LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/projects", label: "Hasil Rakitan" },
  { href: "/about", label: "Tentang" },
] as const;

// PublicHeader is composed into public routes that are already request-dynamic
// because they call getCurrentUser(), which reads cookies. React cache()
// memoizes this zero-argument read for the duration of that server request.
const getActiveBundlesCached = cache(getActiveBundles);

// No shared site-wide header exists yet (app/layout.tsx renders no chrome) —
// this public-marketing header is composed explicitly by each route that uses
// it. `user` is still fetched once by the page and passed down, same as
// always. The outlined brand mark and hard-shadow CTA give the public entry
// points a clear, tactile hierarchy.
//
// Async because it now also fetches active bundles (CAT-005) for the promo
// badge below. Every call site splices it in as `{await PublicHeader({ user
// })}`, not `<PublicHeader user={user} />` — Next's real RSC renderer would
// resolve a nested async component either way, but plain React (as used by
// this codebase's Vitest + Testing Library setup, see app/dashboard/page.tsx's
// "async page, synchronous children" convention) can't render an async
// function component reached via JSX, only one that's already been awaited
// into a plain element tree. Explicit-await keeps both production behavior
// and testability intact.
export async function PublicHeader({ user }: { user: User | null }) {
  const activeBundles = await getActiveBundlesCached();

  return (
    <header className="border-b-2 border-brand-ink bg-brand-cream font-sans">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-sans text-xl font-extrabold text-brand-ink">DirakitPro</span>
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
              <AccountMenu />
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

        {activeBundles.length > 0 && (
          <div className="flex justify-center border-t-2 border-brand-ink py-2">
            <BundlePromoBadge bundles={activeBundles} />
          </div>
        )}

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

// CAT-005: any number of bundles can be ACTIVE-and-in-window at once, and
// getActiveBundles() returns them in whatever order the DB gives back (no
// orderBy) — there's no "most recent" to reach for without inventing an
// ordering the query doesn't promise. So: exactly one active bundle gets
// named directly and links straight to it; two or more collapse into one
// badge naming the campaign generically and linking to /bundles, where every
// active bundle is actually listed. This is a promotional link rather than
// a status/category tag, so it uses the requested solid brand-amber token;
// keeping it compact and shadowless distinguishes it from the primary CTA.
function BundlePromoBadge({ bundles }: { bundles: Bundle[] }) {
  const single = bundles.length === 1 ? bundles[0] : null;
  const href = single ? `/bundles/${single.slug}` : "/bundles";
  const label = single ? single.title : "Bundle aktif";

  return (
    <Link
      href={href}
      className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-brand-amber px-3 py-1.5 text-micro font-semibold text-brand-ink transition-opacity hover:opacity-80"
      title={label}
    >
      <Package aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
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
