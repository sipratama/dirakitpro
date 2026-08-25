import "server-only";
import { courses, db, type Course } from "@dirakitpro/database";
import { desc } from "drizzle-orm";

/** All courses across every status (ADM-002) — unlike the public catalog (CAT-003), which only surfaces PUBLISHED. */
export async function getCoursesForAdmin(): Promise<Course[]> {
  return db.select().from(courses).orderBy(desc(courses.createdAt));
}
