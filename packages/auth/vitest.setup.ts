import { config } from "dotenv";
import { vi } from "vitest";

config({ path: ".env.local" });

// "server-only" always throws outside Next's RSC bundler, which is by design —
// it has no effect here since Vitest isn't Next's build pipeline anyway.
vi.mock("server-only", () => ({}));
