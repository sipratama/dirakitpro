import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CssReveal } from "@/components/home/css-reveal";
import { HeroVisual } from "@/components/home/hero-visual";
import { MemphisShapes } from "@/components/home/memphis-shapes";

// The Hero uses the Homepage's strongest tactile treatment: an ink outline,
// amber marker highlight, and hard-shadow CTAs frame the brand promise without
// changing the shared brand-* palette used by the rest of the product.
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-cream font-sans">
      <MemphisShapes />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 md:grid-cols-[55%_45%] md:items-center md:px-6 md:py-28">
        <div className="flex flex-col gap-6">
          <CssReveal>
            <span className="block w-fit rounded-control border-2 border-brand-ink bg-brand-amber px-3 py-1 text-xs font-bold tracking-wide text-brand-ink uppercase">
              Mulai dari rakitan pertama
            </span>

            <h1 className="mt-6 font-sans text-[52px] leading-[1.05] font-extrabold text-brand-ink md:text-[68px] lg:text-[76px]">
              Profesional itu{" "}
              <span className="relative inline-block">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-[-4px] bottom-[0.12em] -z-10 h-[0.42em] -rotate-2 bg-brand-amber"
                />
                dirakit.
              </span>
            </h1>
          </CssReveal>

          <p className="max-w-[520px] text-lg text-brand-ink/70 md:text-xl">
            Belajar dengan membangun sesuatu yang nyata. Ikuti tahapnya, lihat progress rakitanmu, lalu selesaikan
            karya yang bisa kamu tunjukkan.
          </p>

          <CssReveal delayMs={80}>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/register" />}
                className="h-auto rounded-control border-2 border-brand-ink bg-brand-amber px-6 py-3 text-base font-bold text-brand-ink shadow-hard-lg transition-transform duration-150 ease-out hover:translate-x-1 hover:translate-y-1 active:translate-x-[7px] active:translate-y-[7px]"
              >
                Mulai Merakit
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/courses" />}
                className="h-auto rounded-control border-2 border-brand-ink bg-white px-6 py-3 text-base font-bold text-brand-ink shadow-hard-sm transition-transform duration-150 ease-out hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1"
              >
                Lihat Course
              </Button>
            </div>
          </CssReveal>

          <p className="text-sm font-medium text-brand-ink/60">Belajar. Rakit. Selesaikan.</p>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
