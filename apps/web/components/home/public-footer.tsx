import Link from "next/link";

// Only real, existing routes are linked. The Stitch reference footer showed
// "Tentang Kami" / "Kebijakan Privasi" / "Syarat & Ketentuan" / "Bantuan" —
// none of those correspond to any route in the app, so they're omitted
// rather than linked as dead links.
const FOOTER_LINKS = [
  { href: "/courses", label: "Course" },
  { href: "/bundles", label: "Bundle" },
  { href: "/projects", label: "Showcase" },
] as const;

export function PublicFooter() {
  return (
    <footer className="border-t border-neutral-100 bg-brand-cream">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-h3 text-brand-ink">DirakitPro</p>
          <p className="text-small text-neutral-600">Profesional itu dirakit.</p>
        </div>

        <nav aria-label="Navigasi footer" className="flex gap-6 text-body text-neutral-600">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-brand-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-small text-neutral-600">© {new Date().getFullYear()} DirakitPro</p>
      </div>
    </footer>
  );
}
