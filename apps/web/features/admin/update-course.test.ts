import { courses, db, type NewCourse } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import type { CourseInput } from "./create-course";
import { CourseNotFoundError, InvalidSlugFormatError, SlugConflictError } from "./errors";
import { updateCourse } from "./update-course";

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

function inputFrom(course: { slug: string; title: string; outcomeDescription: string; description: string }, overrides: Partial<CourseInput> = {}): CourseInput {
  return {
    slug: course.slug,
    title: course.title,
    outcomeDescription: course.outcomeDescription,
    description: course.description,
    difficulty: null,
    durationEstimate: null,
    thumbnailUrl: null,
    price: "0",
    currency: "IDR",
    resources: [],
    ...overrides,
  };
}

describe("updateCourse", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("updates fields on an existing course", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);

    const updated = await updateCourse(course.id, inputFrom(course, { title: "New Title", price: "149000" }));

    expect(updated.title).toBe("New Title");
    expect(updated.price).toBe("149000.00");
  });

  it("throws for a nonexistent course id", async () => {
    await expect(
      updateCourse("00000000-0000-0000-0000-000000000000", inputFrom({ slug: uniqueSlug("x"), title: "x", outcomeDescription: "x", description: "x" })),
    ).rejects.toThrow(CourseNotFoundError);
  });

  it("rejects an invalid slug format", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);

    await expect(updateCourse(course.id, inputFrom(course, { slug: "Bad Slug!" }))).rejects.toThrow(InvalidSlugFormatError);
  });

  it("rejects a slug already used by a different course", async () => {
    const courseA = await insertCourse();
    const courseB = await insertCourse();
    courseIds.push(courseA.id, courseB.id);

    await expect(updateCourse(courseB.id, inputFrom(courseB, { slug: courseA.slug }))).rejects.toThrow(SlugConflictError);
  });

  it("allows updating a course while keeping its own slug unchanged", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);

    const updated = await updateCourse(course.id, inputFrom(course, { title: "Same slug, new title" }));
    expect(updated.slug).toBe(course.slug);
  });
});
