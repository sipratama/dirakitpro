// The Homepage's signature visual: a learner-built personal website, shown
// mid-assembly with an overlapping build-progress card — not a generic SaaS
// dashboard mockup. Same approved static content the Homepage content rules
// require (real learner name/domain, no fabricated stats). Visual language
// is DESIGN.md 8 (Memphis Digital Workshop) — scoped to this component only.
//
// Pure CSS keyframes (scoped below, no JS) drive a one-time entrance settle;
// content is already in its final, fully visible position in server-
// rendered / no-JS output. `prefers-reduced-motion` disables it outright.
const LEARNER_NAME = "Singgih Pratama";
const LEARNER_ROLE = "Backend & Integration Engineer";
const LEARNER_DOMAIN = "singgihpratama.com";

const STAGES = [
  { label: "Struktur", state: "done" },
  { label: "Hero", state: "done" },
  { label: "Tentang Saya", state: "done" },
  { label: "Project Showcase", state: "current" },
  { label: "Responsive", state: "upcoming" },
  { label: "Deploy", state: "upcoming" },
] as const;

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg pb-10">
      <style>{`
        @keyframes dp-hero-settle { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .dp-hero-settle { animation: dp-hero-settle 600ms ease-out backwards; }
        @media (prefers-reduced-motion: reduce) {
          .dp-hero-settle { animation: none; }
        }
      `}</style>

      {/* The project preview — a slightly tilted browser card */}
      <div
        className="dp-hero-settle relative -rotate-2 rounded-card border-2 border-memphis-ink bg-white shadow-hard-lg"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex items-center gap-2 border-b-2 border-memphis-ink px-4 py-3">
          <span className="size-2.5 rounded-full bg-memphis-coral" />
          <span className="size-2.5 rounded-full bg-memphis-mustard" />
          <span className="size-2.5 rounded-full bg-memphis-teal" />
          <span className="ml-2 rounded-control bg-memphis-cream px-3 py-1 text-xs font-medium text-memphis-ink/70">
            {LEARNER_DOMAIN}
          </span>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div>
            <p className="font-display-memphis text-xl font-extrabold text-memphis-ink">{LEARNER_NAME}</p>
            <p className="text-sm font-semibold text-memphis-coral">{LEARNER_ROLE}</p>
          </div>

          <p className="text-sm text-memphis-ink/70">
            Membangun backend, integration, dan produk digital yang dapat digunakan.
          </p>

          <div className="flex flex-wrap gap-2 text-xs font-bold text-memphis-ink">
            <span className="rounded-control border-2 border-memphis-ink bg-memphis-mustard px-2.5 py-1">
              Tentang Saya
            </span>
            <span className="rounded-control border-2 border-memphis-ink px-2.5 py-1">Project Showcase</span>
            <span className="rounded-control border-2 border-memphis-ink px-2.5 py-1">Contact</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 rounded-control border-2 border-memphis-ink bg-memphis-teal/15" />
            <div className="h-16 rounded-control border-2 border-memphis-ink bg-memphis-sky/15" />
          </div>
        </div>
      </div>

      {/* Connected assembly-progress card, overlapping the preview */}
      <div
        className="dp-hero-settle absolute -bottom-2 -left-6 w-64 rotate-1 rounded-card border-2 border-memphis-ink bg-white p-4 shadow-hard-sm"
        style={{ animationDelay: "180ms" }}
      >
        <p className="mb-3 text-xs font-bold tracking-wide text-memphis-ink uppercase">Progress Rakitan</p>
        <ul className="flex flex-col gap-2.5">
          {STAGES.map((stage, index) => (
            <li key={stage.label} className="relative flex items-center gap-2.5">
              {index > 0 && (
                <span aria-hidden="true" className="absolute -top-2.5 left-[9px] h-2.5 w-px bg-memphis-ink/25" />
              )}
              <StageNode state={stage.state} />
              <span
                className={
                  stage.state === "upcoming" ? "text-xs text-memphis-ink/50" : "text-xs font-semibold text-memphis-ink"
                }
              >
                {stage.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StageNode({ state }: { state: "done" | "current" | "upcoming" }) {
  if (state === "done") {
    return (
      <span
        aria-hidden="true"
        className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-memphis-ink bg-memphis-teal text-[10px] font-bold text-white"
      >
        ✓
      </span>
    );
  }
  if (state === "current") {
    return (
      <span
        aria-hidden="true"
        className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-memphis-ink bg-memphis-mustard"
      >
        <span className="size-1.5 rounded-full bg-memphis-ink" />
      </span>
    );
  }
  return <span aria-hidden="true" className="size-5 shrink-0 rounded-full border-2 border-memphis-ink/25 bg-memphis-cream" />;
}
