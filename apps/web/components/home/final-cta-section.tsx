import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="bg-brand-ink py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 text-center">
        <h2 className="text-h1 text-brand-cream">Rakitan pertamamu dimulai di sini.</h2>
        <Button
          size="lg"
          className="bg-brand-amber text-brand-ink hover:bg-brand-amber/90 focus-visible:ring-brand-amber/50"
          nativeButton={false}
          render={<Link href="/register" />}
        >
          Mulai Merakit
        </Button>
      </div>
    </section>
  );
}
