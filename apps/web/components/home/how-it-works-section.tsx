import { Check, Hammer, BookOpen, ListChecks } from "lucide-react";
import { CssReveal } from "@/components/home/css-reveal";

// State colors mirror the real learning-progress language (teal=completed,
// current=strongest emphasis, neutral=upcoming — see
// components/learning/build-progress-bar.tsx) but each state also carries a
// distinct icon and label so meaning never depends on color alone. "Rakit" is
// both the active step and the DirakitPro method itself, so its ink outline,
// amber tint, and hard shadow create the strongest emphasis while completed
// and upcoming steps stay on quieter progress and neutral treatments.
const STEPS = [
  { label: "Pilih", title: "Pilih Rakitan", state: "completed", icon: Check },
  { label: "Pelajari", title: "Pelajari Konsep", state: "completed", icon: BookOpen },
  { label: "Rakit", title: "Rakit Tahap demi Tahap", state: "current", icon: Hammer },
  { label: "Jadi", title: "Selesaikan Karyamu", state: "upcoming", icon: ListChecks },
] as const;

const CARD_STYLES = {
  completed: "border border-neutral-100 bg-surface",
  current: "border-2 border-brand-ink bg-brand-amber-tint shadow-hard-sm",
  upcoming: "border border-neutral-100 bg-surface",
} as const;

const ICON_STYLES = {
  completed: "border-brand-teal bg-success-bg text-brand-teal-text",
  current: "border-brand-ink bg-brand-amber text-brand-ink",
  upcoming: "border-neutral-100 bg-neutral-50 text-neutral-600",
} as const;

// Each step uses the same no-JS CssReveal primitive as the other Homepage
// sections. The rails have their own CSS-only fill animation so they resolve
// progressively between cards rather than appearing all at once. Both motion
// layers always leave the real content in the DOM and are removed outright
// under prefers-reduced-motion.
export function HowItWorksSection() {
  return (
    <section className="bg-brand-cream py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-h1 text-brand-ink">Belajar sambil merakit.</h2>
        <p className="mt-2 text-body-lg text-neutral-600">
          Bukan sekadar menonton — kamu membangun rakitanmu sendiri, satu tahap pada satu waktu.
        </p>

        <style>{`
          @keyframes dp-flow-fill-h { from { transform: scaleX(0); } to { transform: scaleX(1); } }
          @keyframes dp-flow-fill-v { from { transform: scaleY(0); } to { transform: scaleY(1); } }

          .dp-flow-connector-h { transform-origin: left center; animation: dp-flow-fill-h 320ms ease-out backwards; }
          .dp-flow-connector-v { transform-origin: top center; animation: dp-flow-fill-v 320ms ease-out backwards; }
          [data-connector="0"] { animation-delay: 100ms; }
          [data-connector="1"] { animation-delay: 200ms; }
          [data-connector="2"] { animation-delay: 300ms; }

          @media (prefers-reduced-motion: reduce) {
            .dp-flow-connector-h,
            .dp-flow-connector-v {
              animation: none;
            }
          }
        `}</style>

        <ol className="relative mt-10 grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-0">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isRakit = step.label === "Rakit";
            const isLast = index === STEPS.length - 1;

            return (
              <li key={step.label} className="relative lg:mx-3">
                <CssReveal
                  delayMs={index * 100}
                  className={`flex h-full flex-col gap-3 rounded-card p-6 ${CARD_STYLES[step.state]}`}
                >
                  <div
                    className={`flex size-10 items-center justify-center rounded-full border ${ICON_STYLES[step.state]}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </div>

                  <span className="[font-family:var(--font-mono-home)] text-micro text-neutral-600">
                    STEP.{String(index + 1).padStart(2, "0")} — {step.label}
                  </span>
                  <h3 className={isRakit ? "text-h3 text-brand-ink" : "text-body-lg font-medium text-brand-ink"}>
                    {step.title}
                  </h3>

                  {/* Compact connected build-progress echo — reinforces the
                      same Progress Rakitan motif from the Hero, at a fraction
                      of the size and with no labels, since "Rakit Tahap demi
                      Tahap" already names the step. */}
                  {isRakit && (
                    <div aria-hidden="true" className="mt-1 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-brand-teal" />
                      <span className="h-px w-2 bg-brand-ink/20" />
                      <span className="size-1.5 rounded-full bg-brand-teal" />
                      <span className="h-px w-2 bg-brand-ink/20" />
                      <span className="size-1.5 rounded-full bg-brand-teal" />
                      <span className="h-px w-2 bg-brand-ink/20" />
                      <span className="size-2 rounded-full border-2 border-brand-ink bg-brand-amber" />
                    </div>
                  )}
                </CssReveal>

                {!isLast && (
                  <>
                    {/* Rail color reflects whether this segment has already
                        been built: teal after completed steps, neutral after
                        current/upcoming steps. */}
                    <span
                      aria-hidden="true"
                      data-connector={index}
                      className={`dp-flow-connector-h absolute top-11 -right-3 hidden h-1 w-6 rounded-full lg:block ${
                        step.state === "completed" ? "bg-brand-teal" : "bg-neutral-200"
                      }`}
                    />
                    <span
                      aria-hidden="true"
                      data-connector={index}
                      className={`dp-flow-connector-v absolute bottom-[-1.5rem] left-1/2 h-6 w-1 -translate-x-1/2 rounded-full lg:hidden ${
                        step.state === "completed" ? "bg-brand-teal" : "bg-neutral-200"
                      }`}
                    />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
