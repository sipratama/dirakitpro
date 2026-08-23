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
import { getBundleEligibleCount } from "./get-bundle-eligibility";

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
      type: "CHOOSE_N",
      selectionCount: 2,
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

describe("getBundleEligibleCount", () => {
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

  it("returns a count below N (selectionCount) when the learner already owns every eligible course (10.8)", async () => {
    const bundle = await insertBundle({ type: "CHOOSE_N", selectionCount: 2 });
    bundleIds.push(bundle.id);
    const courseA = await insertCourse();
    const courseB = await insertCourse();
    courseIds.push(courseA.id, courseB.id);
    await db.insert(bundleCourses).values([
      { bundleId: bundle.id, courseId: courseA.id },
      { bundleId: bundle.id, courseId: courseB.id },
    ]);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(enrollments).values([
      { userId: learner.id, courseId: courseA.id, status: "ACTIVE" },
      { userId: learner.id, courseId: courseB.id, status: "ACTIVE" },
    ]);

    const eligibleCount = await getBundleEligibleCount(bundle.id, learner.id);

    expect(eligibleCount).toBe(0);
    expect(eligibleCount).toBeLessThan(bundle.selectionCount!);
  });

  it("counts only the unowned eligible courses when the learner owns some but not all", async () => {
    const bundle = await insertBundle({ type: "CHOOSE_N", selectionCount: 2 });
    bundleIds.push(bundle.id);
    const owned = await insertCourse();
    const unowned = await insertCourse();
    courseIds.push(owned.id, unowned.id);
    await db.insert(bundleCourses).values([
      { bundleId: bundle.id, courseId: owned.id },
      { bundleId: bundle.id, courseId: unowned.id },
    ]);
    const learner = await insertLearner();
    userIds.push(learner.id);
    await db.insert(enrollments).values({ userId: learner.id, courseId: owned.id, status: "ACTIVE" });

    const eligibleCount = await getBundleEligibleCount(bundle.id, learner.id);

    expect(eligibleCount).toBe(1);
  });

  it("returns the full eligible course count for a learner with no relevant enrollments", async () => {
    const bundle = await insertBundle({ type: "CHOOSE_N", selectionCount: 2 });
    bundleIds.push(bundle.id);
    const courseA = await insertCourse();
    const courseB = await insertCourse();
    courseIds.push(courseA.id, courseB.id);
    await db.insert(bundleCourses).values([
      { bundleId: bundle.id, courseId: courseA.id },
      { bundleId: bundle.id, courseId: courseB.id },
    ]);
    const learner = await insertLearner();
    userIds.push(learner.id);

    const eligibleCount = await getBundleEligibleCount(bundle.id, learner.id);

    expect(eligibleCount).toBe(2);
  });
});
