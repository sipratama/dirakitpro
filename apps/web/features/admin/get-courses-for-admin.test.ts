import { courses, db, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getCoursesForAdmin } from "./get-courses-for-admin";

function uniqueSlug(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

async function insertCourse(overrides: Partial<NewCourse> = {}) {
  const [course] = await db
    .insert(courses)
    .values({
      slug: uniqueSlug("test-course"),
      title: "Test Course",
      outcomeDescription: "Outcome",
      description: "Description",
      price: "0",
      ...overrides,
    })
    .returning();
  return course;
}

describe("getCoursesForAdmin", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  // This reads the entire courses table with no scoping — the test suite
  // runs files in parallel against one shared dev DB, so we assert via
  // `.find()` on a self-created row instead of an absolute list length
  // (same convention as get-users-for-admin.test.ts / get-orders-for-admin.test.ts).
  it("includes courses of every status, not just PUBLISHED", async () => {
    const draft = await insertCourse({ status: "DRAFT" });
    const published = await insertCourse({ status: "PUBLISHED" });
    const unpublished = await insertCourse({ status: "UNPUBLISHED" });
    courseIds.push(draft.id, published.id, unpublished.id);

    const result = await getCoursesForAdmin();

    expect(result.find((c) => c.id === draft.id)?.status).toBe("DRAFT");
    expect(result.find((c) => c.id === published.id)?.status).toBe("PUBLISHED");
    expect(result.find((c) => c.id === unpublished.id)?.status).toBe("UNPUBLISHED");
  });
});
