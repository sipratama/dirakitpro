"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// PRJ-009 — copy link, generic Web Share where the browser supports it, and
// an explicit LinkedIn share link as the named minimum. Reads `window` at
// click time (never during render/effects), so no client-only mount dance is
// needed and there's nothing to keep in sync with SSR markup.
export function ShareActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    if (typeof navigator.share === "function") {
      await navigator.share({ title, url: window.location.href });
    }
  }

  function shareToLinkedIn() {
    const href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" variant="outline" onClick={copyLink}>
        {copied ? "Link disalin!" : "Copy link"}
      </Button>
      <Button type="button" variant="outline" onClick={share}>
        Share
      </Button>
      <Button type="button" variant="outline" onClick={shareToLinkedIn}>
        Share ke LinkedIn
      </Button>
    </div>
  );
}
