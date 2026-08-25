// Decorative "parts being assembled" background for the Homepage hero
// (DESIGN.md 8.4) — six shapes, each its own gentle drift/rotate/bob/sway/
// stillness so none of them sync up and not every shape moves. Pure CSS
// keyframes, no JS; disabled outright under prefers-reduced-motion rather
// than just slowed. pointer-events-none and aria-hidden since these carry
// no content.
export function MemphisShapes() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes dp-shape-drift { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(10px, -14px) rotate(6deg); } }
        @keyframes dp-shape-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes dp-shape-tiny-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes dp-shape-sway { 0%, 100% { transform: translateX(0) rotate(-3deg); } 50% { transform: translateX(12px) rotate(3deg); } }
        @keyframes dp-shape-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .dp-shape-drift { animation: dp-shape-drift 18s ease-in-out infinite; }
        .dp-shape-bob { animation: dp-shape-bob 14s ease-in-out infinite; }
        .dp-shape-tiny-bob { animation: dp-shape-tiny-bob 16s ease-in-out infinite; }
        .dp-shape-sway { animation: dp-shape-sway 22s ease-in-out infinite; }
        .dp-shape-spin { animation: dp-shape-spin 28s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .dp-shape-drift, .dp-shape-bob, .dp-shape-tiny-bob, .dp-shape-sway, .dp-shape-spin { animation: none; }
        }
      `}</style>

      {/* triangle — slow small drift */}
      <svg className="dp-shape-drift absolute top-[10%] left-[5%] size-10" viewBox="0 0 40 40" fill="none">
        <path d="M20 4 L36 34 L4 34 Z" strokeWidth="2" className="fill-memphis-coral stroke-memphis-ink" />
      </svg>

      {/* quarter arc — small bob */}
      <svg className="dp-shape-bob absolute top-[16%] right-[8%] size-12" viewBox="0 0 48 48" fill="none">
        <path d="M4 44 A40 40 0 0 0 44 4 L44 44 Z" strokeWidth="2" className="fill-memphis-teal stroke-memphis-ink" />
      </svg>

      {/* half-circle — slow sway */}
      <svg className="dp-shape-sway absolute bottom-[16%] left-[9%] size-14" viewBox="0 0 56 28" fill="none">
        <path d="M2 26 A26 26 0 0 1 54 26 Z" strokeWidth="2" className="fill-memphis-mustard stroke-memphis-ink" />
      </svg>

      {/* plus — slow rotate */}
      <svg className="dp-shape-spin absolute top-[46%] left-[2%] size-8" viewBox="0 0 32 32" fill="none">
        <path d="M13 2 H19 V13 H30 V19 H19 V30 H13 V19 H2 V13 H13 Z" strokeWidth="2" className="fill-memphis-violet stroke-memphis-ink" />
      </svg>

      {/* zigzag — very small vertical movement only, no rotation */}
      <svg className="dp-shape-tiny-bob absolute bottom-[10%] right-[4%] size-16" viewBox="0 0 64 20" fill="none">
        <path d="M2 18 L14 2 L26 18 L38 2 L50 18 L62 2" strokeWidth="4" strokeLinecap="round" className="stroke-memphis-sky" />
      </svg>

      {/* assembly squiggle — deliberately still; not every shape should move */}
      <svg className="absolute top-[66%] right-[24%] size-10" viewBox="0 0 40 40" fill="none">
        <path d="M4 32 Q12 12 20 24 T36 8" strokeWidth="3" strokeLinecap="round" className="stroke-memphis-ink" />
      </svg>
    </div>
  );
}
