import { cleanup } from "@testing-library/react";
import { config } from "dotenv";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

config({ path: ".env.local" });

// No `test.globals` in vitest.config.ts, so RTL's own auto-cleanup (which
// checks for a global `afterEach`) never registers — do it explicitly instead,
// otherwise DOM component tests leak render output across `it` blocks.
afterEach(() => cleanup());

// "server-only" always throws outside Next's RSC bundler, which is by design —
// it has no effect here since Vitest isn't Next's build pipeline anyway.
vi.mock("server-only", () => ({}));

// jsdom doesn't implement IntersectionObserver at all (unlike every real
// target browser), so any component using it — e.g. Homepage's
// RevealOnScroll — throws on mount under RTL. Stub it to fire its callback
// as "intersecting" immediately: jsdom has no real viewport/scroll geometry
// to observe anyway, so tests just want the revealed end-state.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    constructor(private readonly callback: IntersectionObserverCallback) {}
    observe(target: Element) {
      this.callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this,
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  globalThis.IntersectionObserver = MockIntersectionObserver;
}
