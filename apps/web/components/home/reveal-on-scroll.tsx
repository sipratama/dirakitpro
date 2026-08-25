"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Fires a restrained, one-time reveal transition when its content first
 * enters the viewport (How It Works / Why DirakitPro, per the Homepage
 * motion spec — no looping, no scroll-jacking, no parallax).
 *
 * Respects `prefers-reduced-motion: reduce` in CSS by skipping the
 * transition and forcing content into its final visible position immediately.
 */
export function RevealOnScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // `prefers-reduced-motion` is handled entirely in CSS below: the
    // motion-reduce variants force the visible end-state immediately, while
    // the observer still manages the normal-motion one-time reveal.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
