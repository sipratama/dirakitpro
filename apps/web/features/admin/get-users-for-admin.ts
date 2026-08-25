import "server-only";
import { db, enrollments, users, type User } from "@dirakitpro/database";
import { count, eq } from "drizzle-orm";

export type UserWithEnrollmentCount = User & { enrollmentCount: number };

/** Read-only learner view for `/admin/users` (ADM-005) — email/username, role, joined date, enrollment count. */
export async function getUsersForAdmin(): Promise<UserWithEnrollmentCount[]> {
  const rows = await db
    .select({ user: users, enrollmentCount: count(enrollments.id) })
    .from(users)
    .leftJoin(enrollments, eq(enrollments.userId, users.id))
    .groupBy(users.id)
    .orderBy(users.createdAt);

  return rows.map(({ user, enrollmentCount }) => ({ ...user, enrollmentCount }));
}
