"use client";

import posthog from "posthog-js";
import { Button } from "@/components/ui/button";

export function MentoringCta() {
  return (
    <Button
      size="lg"
      nativeButton={false}
      render={<a href="#TODO-mentoring-link" target="_blank" rel="noopener noreferrer" />}
      onClick={() => posthog.capture("mentoring_cta_clicked")}
      className="h-auto rounded-control border-2 border-brand-ink bg-brand-amber px-6 py-3 text-base font-bold text-brand-ink shadow-hard-sm transition-transform duration-150 ease-out hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1"
    >
      Diskusikan mentoring
    </Button>
  );
}
