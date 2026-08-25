import "server-only";
import { courses, db, type Course } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import type { ContentBlock } from "@/features/learning/content-block";
import { isHttpUrl } from "@/features/project/is-http-url";
import { InvalidSlugFormatError, InvalidThumbnailUrlError, SlugConflictError } from "./errors";
import { isValidSlugFormat } from "./is-valid-slug-format";

export type CourseInput = {
  slug: string;
  title: string;
  outcomeDescription: string;
  description: string;
  difficulty: string | null;
  durationEstimate: string | null;
  thumbnailUrl: string | null;
  price: string;
  currency: string;
  resources: ContentBlock[];
};

/** ADM-002 course creation. Slug format and uniqueness are validated here, not only relied on as a DB unique constraint, so a conflict fails with a clear error instead of a raw constraint-violation crash. */
export async function createCourse(input: CourseInput): Promise<Course> {
  if (!isValidSlugFormat(input.slug)) throw new InvalidSlugFormatError();
  if (input.thumbnailUrl && !isHttpUrl(input.thumbnailUrl)) throw new InvalidThumbnailUrlError();

  const [existing] = await db.select({ id: courses.id }).from(courses).where(eq(courses.slug, input.slug)).limit(1);
  if (existing) throw new SlugConflictError();

  const [created] = await db
    .insert(courses)
    .values({
      slug: input.slug,
      title: input.title,
      outcomeDescription: input.outcomeDescription,
      description: input.description,
      difficulty: input.difficulty,
      durationEstimate: input.durationEstimate,
      thumbnailUrl: input.thumbnailUrl,
      price: input.price,
      currency: input.currency,
      resources: input.resources,
    })
    .returning();
  return created;
}
