// Replaces the old IntersectionObserver-based RevealOnScroll: live inspection
// during the V2 pass found its scroll-triggered reveal shipped server-rendered
// HTML at opacity:0 that only became visible once client JS ran and the
// observer fired. That's invisible-by-default content — a real risk for
// no-JS/slow-JS visitors, crawlers, and any tool that renders the page at
// full height in one shot (screenshot capture, print-to-PDF), all of which
// can catch or leave the content stuck in its hidden state.
//
// A CSS `animation` sidesteps all of that: it always completes on its own
// shortly after paint — no JS required, nothing to fail to fire. The
// tradeoff is it plays on paint rather than on scroll-into-view; for content
// this far down the page it's normally already settled by the time a user
// scrolls to it, which is the right trade for the robustness gained.
export function CssReveal({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  return (
    <div className={["dp-css-reveal", className].filter(Boolean).join(" ")} style={{ animationDelay: `${delayMs}ms` }}>
      <style>{`
        .dp-css-reveal { animation: dp-css-reveal-in 600ms ease-out backwards; }
        @media (prefers-reduced-motion: reduce) {
          .dp-css-reveal { animation: none; }
        }
        @keyframes dp-css-reveal-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {children}
    </div>
  );
}
