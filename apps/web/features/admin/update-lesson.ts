import "server-only";
import { buildMilestones, db, lessons, type Lesson } from "@dirakitpro/database";
import { and, eq, ne } from "drizzle-orm";
import type { LessonInput } from "./create-lesson";
import { BuildMilestoneNotFoundError, InvalidSlugFormatError, LessonNotFoundError, SlugConflictError } from "./errors";
import { isValidSlugFormat } from "./is-valid-slug-format";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** ADM-003 — same slug/milestone validation as createLesson; uniqueness excludes this lesson's own current row. Doesn't move the lesson between stages (reorderLessons/create+delete cover that). */
export async function updateLesson(lessonId: string, input: LessonInput): Promise<Lesson> {
  if (!UUID_PATTERN.test(lessonId)) throw new LessonNotFoundError();
  if (!isValidSlugFormat(input.slug)) throw new InvalidSlugFormatError();

  const [existing] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  if (!existing) throw new LessonNotFoundError();

  if (input.buildMilestoneId) {
    const [milestone] = await db
      .select({ id: buildMilestones.id })
      .from(buildMilestones)
      .where(and(eq(buildMilestones.id, input.buildMilestoneId), eq(buildMilestones.courseId, existing.courseId)))
      .limit(1);
    if (!milestone) throw new BuildMilestoneNotFoundError();
  }

  const [slugTaken] = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(and(eq(lessons.slug, input.slug), eq(lessons.courseId, existing.courseId), ne(lessons.id, lessonId)))
    .limit(1);
  if (slugTaken) throw new SlugConflictError();

  const [updated] = await db
    .update(lessons)
    .set({
      slug: input.slug,
      title: input.title,
      type: input.type,
      isRequired: input.isRequired,
      buildMilestoneId: input.buildMilestoneId,
    })
    .where(eq(lessons.id, lessonId))
    .returning();
  return updated;
}
