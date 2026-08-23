import {
  bundleCourses,
  bundles,
  courses,
  db,
  enrollments,
  type NewBundle,
  type NewCourse,
  users,
} from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getBundleBySlug } from "./get-bundle-by-slug";

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
      price: "100000",
      status: "ACTIVE",
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

async function insertLearner() {
  const [user] = await db
    .insert(users)
    .values({
      email: `${uniqueSlug("learner")}@example.com`,
      username: uniqueSlug("learner"),
      displayName: "Test Learner",
      role: "LEARNER",
    })
    .returning();
  return user;
}

describe("getBundleBySlug", () => {
  const bundleIds: string[] = [];
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (userIds.length) await db.delete(enrollments).where(inArray(enrollments.userId, userIds));
    if (bundleIds.length) await db.delete(bundleCourses).where(inArray(bundleCourses.bundleId, bundleIds));
    if (bundleIds.length) await db.delete(bundles).where(inArray(bundles.id, bundleIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    bundleIds.length = 0;
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("returns null for a slug that doesn't exist", async () => {
    expect(await getBundleBySlug(uniqueSlug("nope"))).toBeNull();
  });

  it("FIXED bundle returns every included course unconditionally, each flagged by ownership", async () => {
    const bundle = await insertBundle({ type: "FIXED", selectionCount: null });
    bundleIds.push(bundle.id);
    const owned = await insertCourse();
    const notOwned = await insertCourse();
    courseIds.push(owned.id, notOwned.id);
    await db.insert(bundleCourses).values([
      { bundleId: bundle.id, courseId: owned.id },
      { bundleId: bundle.id, courseId: notOwned.id },
    ]);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(enrollments).values({ userId: learner.id, courseId: owned.id, status: "ACTIVE" });

    const detail = await getBundleBySlug(bundle.slug, learner.id);

    expect(detail?.courses).toHaveLength(2);
    expect(detail?.courses.find((c) => c.id === owned.id)?.alreadyOwned).toBe(true);
    expect(detail?.courses.find((c) => c.id === notOwned.id)?.alreadyOwned).toBe(false);
  });

  it("resolves an INACTIVE bundle instead of hiding it (detail page must explain why it isn't purchasable)", async () => {
    const bundle = await insertBundle({ status: "INACTIVE" });
    bundleIds.push(bundle.id);

    const detail = await getBundleBySlug(bundle.slug);

    expect(detail).not.toBeNull();
    expect(detail?.status).toBe("INACTIVE");
  });
});
