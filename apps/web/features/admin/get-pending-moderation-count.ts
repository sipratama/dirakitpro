import "server-only";
import { db, projects } from "@dirakitpro/database";
import { count, eq } from "drizzle-orm";

/** Count of projects awaiting moderation — the number the `/admin` dashboard points at (ADMIN_CORE.md §2). */
export async function getPendingModerationCount(): Promise<number> {
  const [row] = await db.select({ count: count() }).from(projects).where(eq(projects.moderationStatus, "UNREVIEWED"));
  return row?.count ?? 0;
}
