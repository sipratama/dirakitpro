import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RevealOnScroll } from "@/components/home/reveal-on-scroll";

// Demo project preview uses a static name/domain per the Homepage content
// rules — never a fabricated stat, and never the placeholder name from the
// original Stitch draft ("Dimas Pratama"). No live enrollment backs this
// visual, so it's static markup rather than the real BuildProgressBar.
const DEMO_LEARNER_NAME = "Singgih Pratama";
const DEMO_PROJECT_DOMAIN = "singgihpratama.com";

export function HeroSection() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
      <div className="flex flex-col gap-6">
        <span className="w-fit rounded-full bg-brand-amber-tint px-3 py-1 text-micro text-brand-amber-text">
          Mulai dari rakitan pertama
        </span>
        <h1 className="text-display text-brand-ink">Profesional itu dirakit.</h1>
        <p className="text-body-lg text-neutral-600">
          Belajar dengan merakit proyek nyata, tahap demi tahap — bukan sekadar menonton video sampai
          selesai.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
            Mulai Merakit
          </Button>
          <Button variant="outline" size="lg" nativeButton={false} render={<Link href="/courses" />}>
            Lihat Course
          </Button>
        </div>
      </div>

      <RevealOnScroll>
        <div className="mx-auto w-full max-w-md overflow-hidden rounded-card border border-neutral-100 bg-surface">
          {/* Browser-chrome mock of the finished project — the dominant visual
              element, per the Homepage spec's rebalancing of preview vs. progress. */}
          <div className="flex items-center gap-1.5 border-b border-neutral-100 bg-neutral-50 px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-neutral-100" />
            <span className="size-2.5 rounded-full bg-neutral-100" />
            <span className="size-2.5 rounded-full bg-neutral-100" />
            <span className="ml-2 text-micro text-neutral-600">{DEMO_PROJECT_DOMAIN}</span>
          </div>
          <div className="flex flex-col gap-3 p-6">
            <div className="h-3 w-2/3 rounded-full bg-neutral-100" />
            <div className="h-3 w-full rounded-full bg-neutral-100" />
            <div className="h-24 w-full rounded-control bg-brand-amber-tint" />
            <p className="text-small text-neutral-600">Personal Website — {DEMO_LEARNER_NAME}</p>
          </div>

          {/* Restrained, subordinate progress strip — deliberately smaller and
              lower-contrast than the preview above it. */}
          <div className="border-t border-neutral-100 px-6 py-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full w-4/5 rounded-full bg-brand-teal" />
            </div>
            <p className="mt-1.5 text-micro text-neutral-600">Tahap 4 dari 5</p>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
