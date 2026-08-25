// The Homepage's one signature visual: the finished "Personal Website"
// project drawn as a labeled exploded-assembly diagram — the same way an
// assembly manual annotates each part of what you're building — instead of
// a generic rounded browser-chrome mockup. Every value shown is the same
// approved static content the Homepage content rules require (real learner
// name / domain, no fabricated stats): only the container changed.
//
// Pure CSS keyframes (scoped below, no JS) drive the one-time entrance
// settle so the content is already in its final, fully visible position in
// server-rendered / no-JS output — the animation is a bounded, backwards-
// filled effect that finishes on its own, never a persistent JS-gated
// hidden state. `prefers-reduced-motion` disables it outright.
const DEMO_LEARNER_NAME = "Singgih Pratama";
const DEMO_PROJECT_DOMAIN = "singgihpratama.com";

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <style>{`
        .font-mono-home { font-family: var(--font-mono-home), ui-monospace, monospace; }
        @keyframes dp-hero-settle {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dp-hero-part { animation: dp-hero-settle 500ms ease-out backwards; }
        @media (prefers-reduced-motion: reduce) {
          .dp-hero-part { animation: none; }
        }
      `}</style>

      {/* Spine connecting the three labeled parts — reading top to bottom in
          the same order the real BuildProgressBar reports stages, so the
          metaphor stays true to the product rather than decorative. */}
      <div
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-[3px] w-px border-l border-dashed border-neutral-300"
      />

      <div className="flex flex-col gap-5">
        {/* P.01 — Layout: the browser/domain chrome */}
        <div className="dp-hero-part relative pl-6" style={{ animationDelay: "0ms" }}>
          <span
            className="absolute top-1 left-0 size-1.5 rounded-full border-2 border-brand-amber bg-surface"
            aria-hidden="true"
          />
          <span className="font-mono-home mb-1.5 block text-micro text-neutral-600">P.01 — Layout</span>
          <div className="-rotate-1 overflow-hidden rounded-card border border-neutral-100 bg-surface">
            <div className="flex items-center gap-1.5 border-b border-neutral-100 px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-neutral-100" />
              <span className="size-2.5 rounded-full bg-neutral-100" />
              <span className="size-2.5 rounded-full bg-neutral-100" />
              <span className="font-mono-home ml-2 text-micro text-neutral-600">{DEMO_PROJECT_DOMAIN}</span>
            </div>
          </div>
        </div>

        {/* P.02 — Konten: the assembled focal piece, drawn level (not tilted) */}
        <div className="dp-hero-part relative pl-6" style={{ animationDelay: "120ms" }}>
          <span
            className="absolute top-1 left-0 size-1.5 rounded-full border-2 border-brand-amber bg-surface"
            aria-hidden="true"
          />
          <span className="font-mono-home mb-1.5 block text-micro text-neutral-600">P.02 — Konten</span>
          <div className="overflow-hidden rounded-card border border-neutral-100 bg-surface">
            <div className="flex flex-col gap-3 p-6">
              <div className="h-3 w-2/3 rounded-full bg-neutral-100" />
              <div className="h-3 w-full rounded-full bg-neutral-100" />
              <div className="h-24 w-full rounded-control bg-brand-amber-tint" />
              <p className="text-small text-neutral-600">Personal Website — {DEMO_LEARNER_NAME}</p>
            </div>
          </div>
        </div>

        {/* P.03 — Progress: quietly reuses the teal/neutral progress language */}
        <div className="dp-hero-part relative pl-6" style={{ animationDelay: "240ms" }}>
          <span
            className="absolute top-1 left-0 size-1.5 rounded-full border-2 border-brand-teal bg-surface"
            aria-hidden="true"
          />
          <span className="font-mono-home mb-1.5 block text-micro text-neutral-600">P.03 — Progress</span>
          <div className="rotate-1 overflow-hidden rounded-card border border-neutral-100 bg-surface px-6 py-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full w-4/5 rounded-full bg-brand-teal" />
            </div>
            <p className="font-mono-home mt-1.5 text-micro text-neutral-600">Tahap 4 dari 5</p>
          </div>
        </div>
      </div>
    </div>
  );
}
