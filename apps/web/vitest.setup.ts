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

// `next/font/google` is a compiler plugin (SWC/webpack) — the plain npm
// package has no runtime implementation of `Plus_Jakarta_Sans` (app/layout.tsx)
// or `IBM_Plex_Mono` (app/page.tsx), so importing either outside Next's own
// build (as Vitest does) throws "is not a function". Stub both as
// font-loader-shaped functions; no test asserts on actual font output. Named
// (not dynamic/Proxy) because Vitest's ESM mock handling requires statically
// known export names — add a new entry here if another route loads a font.
const mockFontLoader = () => ({ className: "mock-font", variable: "mock-font-variable", style: {} });
vi.mock("next/font/google", () => ({
  Plus_Jakarta_Sans: mockFontLoader,
  IBM_Plex_Mono: mockFontLoader,
}));
