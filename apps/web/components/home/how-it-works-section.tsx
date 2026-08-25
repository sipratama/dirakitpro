import { Check, Hammer, BookOpen, ListChecks } from "lucide-react";
import { RevealOnScroll } from "@/components/home/reveal-on-scroll";

// State colors mirror the real learning-progress language (teal=completed,
// amber=current, neutral=upcoming — see components/learning/build-progress-bar.tsx)
// but each state also carries a distinct icon and label so meaning never
// depends on color alone.
const STEPS = [
  { label: "Pilih", title: "Pilih Rakitan", state: "completed", icon: Check },
  { label: "Pelajari", title: "Pelajari Konsep", state: "completed", icon: BookOpen },
  { label: "Rakit", title: "Rakit Tahap demi Tahap", state: "current", icon: Hammer },
  { label: "Jadi", title: "Selesaikan Karyamu", state: "upcoming", icon: ListChecks },
] as const;

const STATE_STYLES = {
  completed: "border-brand-teal bg-success-bg text-brand-teal-text",
  current: "border-brand-amber bg-brand-amber-tint text-brand-amber-text",
  upcoming: "border-neutral-100 bg-neutral-50 text-neutral-600",
} as const;

export function HowItWorksSection() {
  return (
    <section className="bg-neutral-50 py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-h1 text-brand-ink">Belajar sambil merakit.</h2>
        <p className="mt-2 text-body-lg text-neutral-600">
          Bukan sekadar menonton — kamu membangun rakitanmu sendiri, satu tahap pada satu waktu.
        </p>

        <RevealOnScroll className="mt-10">
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isRakit = step.label === "Rakit";
              return (
                <li
                  key={step.label}
                  className={
                    isRakit
                      ? "flex flex-col gap-3 rounded-card border-2 border-brand-amber bg-surface p-6 sm:col-span-2 lg:col-span-1 lg:scale-105"
                      : "flex flex-col gap-3 rounded-card border border-neutral-100 bg-surface p-6"
                  }
                >
                  <div
                    className={`flex size-10 items-center justify-center rounded-full border ${STATE_STYLES[step.state]}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <span className="text-micro text-neutral-600">
                    {String(index + 1).padStart(2, "0")} · {step.label}
                  </span>
                  <h3 className={isRakit ? "text-h3 text-brand-ink" : "text-body-lg font-medium text-brand-ink"}>
                    {step.title}
                  </h3>
                </li>
              );
            })}
          </ol>
        </RevealOnScroll>
      </div>
    </section>
  );
}
