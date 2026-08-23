import { config } from "dotenv";

// Must run before `./client` is imported anywhere in this process — the pg
// Pool reads DATABASE_URL at construction time, and drizzle-kit's own CLI
// doesn't auto-load .env.local either (see drizzle.config.ts). A dynamic
// import defers loading `./client`/`./seed` until after config() has run.
config({ path: ".env.local" });

const { pool } = await import("./client");
const { seed } = await import("./seed");

seed()
  .then(async (result) => {
    console.log(`Seeded ${result.courses.length} course(s):`);
    for (const course of result.courses) {
      console.log(`  - ${course.title} (${course.slug}) — Rp${course.price}`);
    }
    console.log(`Seeded bundle "${result.bundle.title}" (${result.bundle.slug}) — status ${result.bundle.status}`);
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await pool.end();
    process.exitCode = 1;
  });
