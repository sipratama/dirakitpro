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
