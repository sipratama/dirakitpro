// One ambient assembly-piece accent for the Homepage hero. It stays at the
// outer edge of the composition so it frames the content instead of competing
// with the project preview. Pure CSS, no JS; motion is removed outright under
// prefers-reduced-motion. pointer-events-none and aria-hidden because it carries
// no content.
export function MemphisShapes() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes dp-shape-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        .dp-shape-bob { animation: dp-shape-bob 14s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .dp-shape-bob { animation: none; }
        }
      `}</style>

      <svg className="dp-shape-bob absolute top-[16%] right-[3%] size-12" viewBox="0 0 48 48" fill="none">
        <path d="M4 44 A40 40 0 0 0 44 4 L44 44 Z" strokeWidth="2" className="fill-brand-teal stroke-brand-ink" />
      </svg>
    </div>
  );
}
