"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Hammer, BookOpen, ListChecks } from "lucide-react";

// State colors mirror the real learning-progress language (teal=completed,
// current=strongest emphasis, neutral=upcoming — see
// components/learning/build-progress-bar.tsx) but each state also carries a
// distinct icon and label so meaning never depends on color alone. "Rakit"
// is the DirakitPro method itself, so it gets the Memphis system's ink
// outline + hard shadow instead of the softer brand-amber treatment used
// for completed/upcoming — those two stay on the calmer brand-* palette
// (VISUAL_POLISH V2.1 Phase 5: this section runs at ~65-75% Memphis
// intensity, not full Hero intensity).
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

// This section is the Homepage's motion signature (VISUAL_POLISH V2.1 Phase
// 9): the four steps run ONE orchestrated "assembly line" reveal the first
// time the section enters the viewport, then settle permanently — no loop,
// no replay. The reveal is pure CSS (transform/filter only, gated by a
// single `data-run` attribute); the only JS is the one-shot
// IntersectionObserver that flips it. Every card already renders its real,
// final, fully-readable state before that observer ever fires — the
// animation is a decorative layer on top of already-correct content, never
// a visibility gate, so this stays correct with JS disabled and under
// `prefers-reduced-motion` (which turns every animation below off outright).
export function HowItWorksSection() {
  const railRef = useRef<HTMLOListElement>(null);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    const el = railRef.current;
    // Graceful degradation, not just a test shim: jsdom (and any real
    // browser without IntersectionObserver) simply never gets the reveal —
    // every card already renders its correct final state from static
    // classes below, so skipping the observer entirely is a safe no-op,
    // not a broken state.
    if (!el || hasRun || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRun(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasRun]);

  return (
    <section className="bg-neutral-50 py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-h1 text-brand-ink">Belajar sambil merakit.</h2>
        <p className="mt-2 text-body-lg text-neutral-600">
          Bukan sekadar menonton — kamu membangun rakitanmu sendiri, satu tahap pada satu waktu.
        </p>

        <style>{`
          @keyframes dp-flow-resolve {
            from { transform: scale(0.95); filter: saturate(0.4) brightness(1.04); }
            to   { transform: scale(1);    filter: saturate(1)    brightness(1); }
          }
          @keyframes dp-flow-fill-h { from { transform: scaleX(0); } to { transform: scaleX(1); } }
          @keyframes dp-flow-fill-v { from { transform: scaleY(0); } to { transform: scaleY(1); } }
          @keyframes dp-flow-hammer { 0% { transform: rotate(0deg); } 45% { transform: rotate(9deg); } 100% { transform: rotate(0deg); } }

          .dp-flow-card { transform-origin: center; }
          [data-run="true"] .dp-flow-card { animation: dp-flow-resolve 420ms ease-out both; }
          [data-run="true"] .dp-flow-card[data-step="0"] { animation-delay: 0ms; }
          [data-run="true"] .dp-flow-card[data-step="1"] { animation-delay: 500ms; }
          [data-run="true"] .dp-flow-card[data-step="2"] { animation-delay: 950ms; animation-duration: 550ms; }
          [data-run="true"] .dp-flow-card[data-step="3"] { animation-delay: 1750ms; }

          .dp-flow-connector-h { transform-origin: left center; }
          .dp-flow-connector-v { transform-origin: top center; }
          [data-run="true"] .dp-flow-connector-h { animation: dp-flow-fill-h 320ms ease-out both; }
          [data-run="true"] .dp-flow-connector-v { animation: dp-flow-fill-v 320ms ease-out both; }
          [data-run="true"] [data-connector="0"] { animation-delay: 420ms; }
          [data-run="true"] [data-connector="1"] { animation-delay: 920ms; }
          [data-run="true"] [data-connector="2"] { animation-delay: 1720ms; }

          [data-run="true"] .dp-flow-hammer { animation: dp-flow-hammer 500ms ease-in-out 1; animation-delay: 1050ms; }

          @media (prefers-reduced-motion: reduce) {
            [data-run="true"] .dp-flow-card,
            [data-run="true"] .dp-flow-connector-h,
            [data-run="true"] .dp-flow-connector-v,
            [data-run="true"] .dp-flow-hammer {
              animation: none !important;
            }
          }
        `}</style>

        <ol
          ref={railRef}
          data-run={hasRun ? "true" : undefined}
          className="relative mt-10 grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-0"
        >
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isRakit = step.label === "Rakit";
            const isLast = index === STEPS.length - 1;

            return (
              <li key={step.label} data-step={index} className={`dp-flow-card relative flex flex-col gap-3 rounded-card p-6 lg:mx-3 ${CARD_STYLES[step.state]}`}>
                <div
                  className={`flex size-10 items-center justify-center rounded-full border ${ICON_STYLES[step.state]}`}
                >
                  <Icon className={isRakit ? "dp-flow-hammer size-5" : "size-5"} aria-hidden="true" />
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

                {!isLast && (
                  <>
                    {/* Rail color reflects whether *this* segment of the line has
                        actually been built yet: teal once the step it leaves is
                        completed, muted while it's still leaving the current/
                        upcoming step — the rail shouldn't claim progress that
                        hasn't happened. */}
                    {/* Desktop: horizontal assembly rail into the gap before the next card */}
                    <span
                      aria-hidden="true"
                      data-connector={index}
                      className={`dp-flow-connector-h absolute top-11 -right-3 hidden h-1 w-6 rounded-full lg:block ${
                        step.state === "completed" ? "bg-brand-teal" : "bg-neutral-200"
                      }`}
                    />
                    {/* Mobile/tablet: vertical rail down into the next stacked card */}
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
