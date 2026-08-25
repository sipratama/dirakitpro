import { courses, db } from "@dirakitpro/database";
import { inArray } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createCourse, type CourseInput } from "./create-course";
import { InvalidSlugFormatError, InvalidThumbnailUrlError, SlugConflictError } from "./errors";

function uniqueSlug(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function baseInput(overrides: Partial<CourseInput> = {}): CourseInput {
  return {
    slug: uniqueSlug("test-course"),
    title: "Test Course",
    outcomeDescription: "Outcome",
    description: "Description",
    difficulty: null,
    durationEstimate: null,
    thumbnailUrl: null,
    price: "0",
    currency: "IDR",
    resources: [],
    ...overrides,
  };
}

describe("createCourse", () => {
  const courseIds: string[] = [];

  afterEach(async () => {
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    courseIds.length = 0;
  });

  it("creates a course as DRAFT with the given fields", async () => {
    const input = baseInput({ price: "149000" });
    const created = await createCourse(input);
    courseIds.push(created.id);

    expect(created.status).toBe("DRAFT");
    expect(created.slug).toBe(input.slug);
    expect(created.price).toBe("149000.00");
  });

  it("rejects an invalid slug format", async () => {
    await expect(createCourse(baseInput({ slug: "Not A Valid Slug!" }))).rejects.toThrow(InvalidSlugFormatError);
  });

  it("rejects a slug that's already taken", async () => {
    const slug = uniqueSlug("dup");
    const first = await createCourse(baseInput({ slug }));
    courseIds.push(first.id);

    await expect(createCourse(baseInput({ slug }))).rejects.toThrow(SlugConflictError);
  });

  it("rejects a non-http(s) thumbnailUrl", async () => {
    await expect(createCourse(baseInput({ thumbnailUrl: "not-a-url" }))).rejects.toThrow(InvalidThumbnailUrlError);
  });

  it("accepts a valid http(s) thumbnailUrl", async () => {
    const created = await createCourse(baseInput({ thumbnailUrl: "https://example.com/thumb.png" }));
    courseIds.push(created.id);

    expect(created.thumbnailUrl).toBe("https://example.com/thumb.png");
  });

  it("stores resources as the given ContentBlock array", async () => {
    const created = await createCourse(
      baseInput({ resources: [{ type: "resource_link", label: "Repo", url: "https://github.com/example/repo" }] }),
    );
    courseIds.push(created.id);

    expect(created.resources).toEqual([{ type: "resource_link", label: "Repo", url: "https://github.com/example/repo" }]);
  });
});
