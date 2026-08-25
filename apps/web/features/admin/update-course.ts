import "server-only";
import { courses, db, type Course } from "@dirakitpro/database";
import { and, eq, ne } from "drizzle-orm";
import { isHttpUrl } from "@/features/project/is-http-url";
import type { CourseInput } from "./create-course";
import { CourseNotFoundError, InvalidSlugFormatError, InvalidThumbnailUrlError, SlugConflictError } from "./errors";
import { isValidSlugFormat } from "./is-valid-slug-format";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** ADM-002 course edit — same slug format/uniqueness rules as createCourse, but uniqueness excludes this course's own current row. */
export async function updateCourse(courseId: string, input: CourseInput): Promise<Course> {
  if (!UUID_PATTERN.test(courseId)) throw new CourseNotFoundError();
  if (!isValidSlugFormat(input.slug)) throw new InvalidSlugFormatError();
  if (input.thumbnailUrl && !isHttpUrl(input.thumbnailUrl)) throw new InvalidThumbnailUrlError();

  const [existing] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!existing) throw new CourseNotFoundError();

  const [slugTaken] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.slug, input.slug), ne(courses.id, courseId)))
    .limit(1);
  if (slugTaken) throw new SlugConflictError();

  const [updated] = await db
    .update(courses)
    .set({
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
    .where(eq(courses.id, courseId))
    .returning();
  return updated;
}
