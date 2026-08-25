import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "@/components/home/hero-visual";

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

      {/* Signature visual: the finished project drawn as a labeled
          exploded-assembly diagram — see hero-visual.tsx. Never gated behind
          scroll-reveal since the hero is always above the fold; its own
          entrance settle is a bounded CSS animation, not a hidden state. */}
      <HeroVisual />
    </section>
  );
}
