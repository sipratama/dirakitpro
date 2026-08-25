import { bundleCourses, bundles, courses, db, type NewBundle, type NewCourse } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { BundleNotFoundError } from "./errors";
import { setBundleEligibleCourses } from "./set-bundle-eligible-courses";

function uniqueSlug(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

async function insertBundle(overrides: Partial<NewBundle> = {}) {
  const [bundle] = await db
    .insert(bundles)
    .values({
      slug: uniqueSlug("test-bundle"),
      title: "Test Bundle",
      description: "Description",
      type: "FIXED",
      price: "299000",
      ...overrides,
    })
    .returning();
  return bundle;
}

async function insertCourse(overrides: Partial<NewCourse> = {}) {
  const [course] = await db
    .insert(courses)
    .values({
      slug: uniqueSlug("test-course"),
      title: "Test Course",
      outcomeDescription: "Outcome",
      description: "Description",
      status: "PUBLISHED",
      price: "0",
      ...overrides,
    })
    .returning();
  return course;
}

describe("setBundleEligibleCourses", () => {
  const bundleIds: string[] = [];
  const courseIds: string[] = [];

  afterEach(async () => {
    if (bundleIds.length) await db.delete(bundleCourses).where(inArray(bundleCourses.bundleId, bundleIds));
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    bundleIds.length = 0;
    courseIds.length = 0;
  });

  it("sets the eligible course list with no warning when count meets selectionCount", async () => {
    const bundle = await insertBundle({ type: "CHOOSE_N", selectionCount: 1 });
    bundleIds.push(bundle.id);
    const course = await insertCourse();
    courseIds.push(course.id);

    const result = await setBundleEligibleCourses(bundle.id, [course.id]);

    expect(result.warning).toBeNull();
    const rows = await db.select().from(bundleCourses).where(eq(bundleCourses.bundleId, bundle.id));
    expect(rows).toHaveLength(1);
  });

  it("replaces the previous set wholesale rather than appending", async () => {
    const bundle = await insertBundle({ type: "FIXED" });
    bundleIds.push(bundle.id);
    const courseA = await insertCourse();
    const courseB = await insertCourse();
    courseIds.push(courseA.id, courseB.id);

    await setBundleEligibleCourses(bundle.id, [courseA.id]);
    await setBundleEligibleCourses(bundle.id, [courseB.id]);

    const rows = await db.select().from(bundleCourses).where(eq(bundleCourses.bundleId, bundle.id));
    expect(rows.map((r) => r.courseId)).toEqual([courseB.id]);
  });

  it("saves with a warning (not an error) when CHOOSE_N eligible count is below selectionCount", async () => {
    const bundle = await insertBundle({ type: "CHOOSE_N", selectionCount: 3 });
    bundleIds.push(bundle.id);
    const course = await insertCourse();
    courseIds.push(course.id);

    const result = await setBundleEligibleCourses(bundle.id, [course.id]);

    expect(result.warning).toContain("selectionCount");
    const rows = await db.select().from(bundleCourses).where(eq(bundleCourses.bundleId, bundle.id));
    expect(rows).toHaveLength(1);
  });

  it("does not warn for a FIXED bundle regardless of count", async () => {
    const bundle = await insertBundle({ type: "FIXED" });
    bundleIds.push(bundle.id);

    const result = await setBundleEligibleCourses(bundle.id, []);
    expect(result.warning).toBeNull();
  });

  it("throws for a nonexistent bundle id", async () => {
    await expect(setBundleEligibleCourses("00000000-0000-0000-0000-000000000000", [])).rejects.toThrow(BundleNotFoundError);
  });
});
