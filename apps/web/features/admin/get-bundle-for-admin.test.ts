import { bundleCourses, bundles, courses, db, type NewBundle, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getBundleForAdmin } from "./get-bundle-for-admin";

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

describe("getBundleForAdmin", () => {
  const bundleIds: string[] = [];
  const courseIds: string[] = [];

  afterEach(async () => {
    if (bundleIds.length) await db.delete(bundleCourses).where(inArray(bundleCourses.bundleId, bundleIds));
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    bundleIds.length = 0;
    courseIds.length = 0;
  });

  it("returns the bundle with its eligible courses", async () => {
    const bundle = await insertBundle();
    bundleIds.push(bundle.id);
    const course = await insertCourse();
    courseIds.push(course.id);
    await db.insert(bundleCourses).values({ bundleId: bundle.id, courseId: course.id });

    const result = await getBundleForAdmin(bundle.id);
    expect(result?.id).toBe(bundle.id);
    expect(result?.eligibleCourses).toHaveLength(1);
    expect(result?.eligibleCourses[0]?.id).toBe(course.id);
  });

  it("returns null for a malformed id", async () => {
    expect(await getBundleForAdmin("not-a-uuid")).toBeNull();
  });

  it("returns null for a well-formed but nonexistent id", async () => {
    expect(await getBundleForAdmin("00000000-0000-0000-0000-000000000000")).toBeNull();
  });

  it("self-heals a stored ACTIVE bundle whose window has lapsed to EXPIRED", async () => {
    const bundle = await insertBundle({ status: "ACTIVE", endsAt: new Date("2000-01-01T00:00:00Z") });
    bundleIds.push(bundle.id);

    const result = await getBundleForAdmin(bundle.id);
    expect(result?.status).toBe("EXPIRED");
  });
});
