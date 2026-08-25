import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "@/components/home/hero-visual";
import { MemphisShapes } from "@/components/home/memphis-shapes";

// Visual language is DESIGN.md 8 (Memphis Digital Workshop) — scoped to the
// Homepage hero only, not the shared brand-* palette used everywhere else.
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-memphis-cream font-body-memphis">
      <MemphisShapes />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 md:grid-cols-[55%_45%] md:items-center md:px-6 md:py-28">
        <div className="flex flex-col gap-6">
          <span className="w-fit rounded-control border-2 border-memphis-ink bg-memphis-mustard px-3 py-1 text-xs font-bold tracking-wide text-memphis-ink uppercase">
            Mulai dari rakitan pertama
          </span>

          <h1 className="font-display-memphis text-[52px] leading-[1.05] font-extrabold text-memphis-ink md:text-[68px] lg:text-[76px]">
            Profesional itu{" "}
            <span className="relative inline-block">
              <span
                aria-hidden="true"
                className="absolute inset-x-[-4px] bottom-[0.12em] -z-10 h-[0.42em] -rotate-2 bg-memphis-mustard"
              />
              dirakit.
            </span>
          </h1>

          <p className="max-w-[520px] text-lg text-memphis-ink/70 md:text-xl">
            Belajar dengan membangun sesuatu yang nyata. Ikuti tahapnya, lihat progress rakitanmu, lalu selesaikan
            karya yang bisa kamu tunjukkan.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/register" />}
              className="h-auto rounded-control border-2 border-memphis-ink bg-memphis-coral px-6 py-3 text-base font-bold text-memphis-ink shadow-hard-lg transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              Mulai Merakit
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/courses" />}
              className="h-auto rounded-control border-2 border-memphis-ink bg-white px-6 py-3 text-base font-bold text-memphis-ink shadow-hard-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              Lihat Course
            </Button>
          </div>

          <p className="text-sm font-medium text-memphis-ink/60">Belajar. Rakit. Selesaikan.</p>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
