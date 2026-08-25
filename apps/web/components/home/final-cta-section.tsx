import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CssReveal } from "@/components/home/css-reveal";

// The Homepage's second high-contrast brand moment (VISUAL_POLISH V2.1
// Phase 12) — reuses the Hero's near-black + tactile hard-shadow language
// rather than the softer brand-amber button used elsewhere, so it reads as
// a deliberate bookend, not a second Hero. One small assembly glyph is the
// section's only decorative detail — no shape field, no gradient.
export function FinalCtaSection() {
  return (
    <section className="bg-brand-ink py-16">
      <CssReveal className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 text-center">
        <svg aria-hidden="true" width="28" height="28" viewBox="0 0 28 28" fill="none" className="mb-1">
          <rect x="2" y="14" width="11" height="11" rx="2" strokeWidth="2" className="fill-brand-teal stroke-brand-cream" />
          <rect
            x="15"
            y="2"
            width="11"
            height="11"
            rx="2"
            strokeWidth="2"
            transform="rotate(8 20.5 7.5)"
            className="fill-brand-amber stroke-brand-cream"
          />
          <circle cx="8" cy="8" r="5.5" strokeWidth="2" className="fill-brand-amber stroke-brand-cream" />
        </svg>

        <h2 className="text-h1 text-brand-cream">Rakitan pertamamu dimulai di sini.</h2>

        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/register" />}
          className="h-auto rounded-control border-2 border-brand-cream bg-brand-amber px-6 py-3 text-base font-bold text-brand-ink shadow-hard-invert-sm transition-transform duration-150 ease-out hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 focus-visible:ring-brand-cream/50"
        >
          Mulai Merakit
        </Button>
      </CssReveal>
    </section>
  );
}
