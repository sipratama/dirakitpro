import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });

export type Database = typeof db;
// The `tx` handle passed into `db.transaction(async (tx) => ...)` — extracted
// via conditional-type inference so callers can write helpers that accept
// either a plain Database or an in-flight Transaction and participate in the
// caller's transaction when given one (needed for webhook idempotency, where
// every side effect must commit/rollback together).
export type Transaction = Parameters<Database["transaction"]>[0] extends (tx: infer TX) => unknown ? TX : never;
