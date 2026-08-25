// The Homepage's signature visual: a learner-built personal website, shown
// mid-assembly with an overlapping build-progress card — not a generic SaaS
// dashboard mockup. The concrete learner name and domain keep the outcome
// believable without introducing fabricated performance or community stats.
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
        /* Entrance settle: translate up + rotate toward final angle, once.
           Rotation is baked into the keyframe (not a separate static
           utility class) so it doesn't collide with the animated
           \`transform\`, and \`both\` fill-mode holds the "to" state after
           the animation ends instead of snapping back to an un-rotated
           base style. */
        @keyframes dp-hero-settle-browser {
          from { opacity: 0; transform: translateY(14px) rotate(0deg); }
          to   { opacity: 1; transform: translateY(0)     rotate(-2deg); }
        }
        @keyframes dp-hero-settle-progress {
          from { opacity: 0; transform: translateY(14px) rotate(0deg); }
          to   { opacity: 1; transform: translateY(0)     rotate(1deg); }
        }
        .dp-hero-settle-browser { animation: dp-hero-settle-browser 650ms ease-out both; }
        .dp-hero-settle-progress { animation: dp-hero-settle-progress 650ms ease-out both; }

        /* Progress Rakitan: nodes resolve in sequence, current node gets one
           restrained pulse — never opacity:0 (labels stay readable
           throughout), just a scale pop-in. */
        @keyframes dp-node-in { from { transform: scale(0.55); } to { transform: scale(1); } }
        @keyframes dp-node-pulse-once { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.18); } }
        .dp-node { animation: dp-node-in 320ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .dp-node-current { animation: dp-node-in 320ms cubic-bezier(0.34, 1.56, 0.64, 1) both, dp-node-pulse-once 500ms ease-in-out 1; }

        @media (prefers-reduced-motion: reduce) {
          .dp-hero-settle-browser, .dp-hero-settle-progress { animation-duration: 0.01ms; }
          .dp-node, .dp-node-current { animation: none; }
        }
      `}</style>

      {/* The project preview — a slightly tilted browser card */}
      <div
        className="dp-hero-settle-browser relative rounded-card border-2 border-brand-ink bg-white shadow-hard-lg"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex items-center gap-2 border-b-2 border-brand-ink px-4 py-3">
          <span className="size-2.5 rounded-full bg-brand-amber" />
          <span className="size-2.5 rounded-full bg-brand-amber" />
          <span className="size-2.5 rounded-full bg-brand-teal" />
          <span className="ml-2 rounded-control bg-brand-cream px-3 py-1 text-xs font-medium text-brand-ink/70">
            {LEARNER_DOMAIN}
          </span>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div>
            <p className="font-sans text-xl font-extrabold text-brand-ink">{LEARNER_NAME}</p>
            <p className="text-sm font-semibold text-brand-amber-text">{LEARNER_ROLE}</p>
          </div>

          <p className="text-sm text-brand-ink/70">
            Membangun backend, integration, dan produk digital yang dapat digunakan.
          </p>

          <div className="flex flex-wrap gap-2 text-xs font-bold text-brand-ink">
            <span className="rounded-control border-2 border-brand-ink bg-brand-amber px-2.5 py-1">
              Tentang Saya
            </span>
            <span className="rounded-control border-2 border-brand-ink px-2.5 py-1">Project Showcase</span>
            <span className="rounded-control border-2 border-brand-ink px-2.5 py-1">Contact</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 rounded-control border-2 border-brand-ink bg-brand-teal/15" />
            <div className="h-16 rounded-control border-2 border-brand-ink bg-brand-ink/15" />
          </div>
        </div>
      </div>

      {/* Connected assembly-progress card, overlapping the preview */}
      <div
        className="dp-hero-settle-progress absolute -bottom-2 -left-6 w-64 rounded-card border-2 border-brand-ink bg-white p-4 shadow-hard-sm"
        style={{ animationDelay: "180ms" }}
      >
        <p className="mb-3 text-xs font-bold tracking-wide text-brand-ink uppercase">Progress Rakitan</p>
        <ul className="flex flex-col gap-2.5">
          {STAGES.map((stage, index) => (
            <li key={stage.label} className="relative flex items-center gap-2.5">
              {index > 0 && (
                <span aria-hidden="true" className="absolute -top-2.5 left-[9px] h-2.5 w-px bg-brand-ink/25" />
              )}
              {/* Nodes resolve left-to-right, matching Struktur → Hero →
                  Tentang Saya → Project Showcase reading order; delay starts
                  after the card itself has settled into place. */}
              <StageNode state={stage.state} delayMs={620 + index * 160} />
              <span
                className={
                  stage.state === "upcoming" ? "text-xs text-brand-ink/50" : "text-xs font-semibold text-brand-ink"
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

function StageNode({ state, delayMs }: { state: "done" | "current" | "upcoming"; delayMs: number }) {
  const style = { animationDelay: `${delayMs}ms` };

  if (state === "done") {
    return (
      <span
        aria-hidden="true"
        style={style}
        className="dp-node flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-brand-ink bg-brand-teal text-[10px] font-bold text-white"
      >
        ✓
      </span>
    );
  }
  if (state === "current") {
    return (
      <span
        aria-hidden="true"
        style={style}
        className="dp-node-current flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-brand-ink bg-brand-amber"
      >
        <span className="size-1.5 rounded-full bg-brand-ink" />
      </span>
    );
  }
  return <span aria-hidden="true" className="size-5 shrink-0 rounded-full border-2 border-brand-ink/25 bg-brand-cream" />;
}
