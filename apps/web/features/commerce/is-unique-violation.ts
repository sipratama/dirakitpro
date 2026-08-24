/**
 * Checks whether a caught error is a Postgres unique-violation (23505) against
 * a specific named constraint/index. Same detection shape as
 * `packages/auth/src/get-current-user.ts` — drizzle-orm wraps the raw pg error
 * (which carries `.code`/`.constraint`) in its own error type with a `.cause`,
 * and which one holds the fields depends on the driver/version, so both are
 * checked. Shared across commerce order-creation paths, which all rely on a
 * partial unique index (not an app-level lock) to make concurrent
 * order/enrollment creation race-safe (COM-015, COM-011).
 */
export function isUniqueViolation(error: unknown, constraint: string): boolean {
  for (const candidate of [error, (error as { cause?: unknown } | null)?.cause]) {
    if (
      typeof candidate === "object" &&
      candidate !== null &&
      (candidate as { code?: string }).code === "23505" &&
      (candidate as { constraint?: string }).constraint === constraint
    ) {
      return true;
    }
  }
  return false;
}
