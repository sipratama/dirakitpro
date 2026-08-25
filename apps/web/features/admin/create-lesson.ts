import "server-only";
import { buildMilestones, courseStages, db, lessons, type Lesson } from "@dirakitpro/database";
import { and, count, eq } from "drizzle-orm";
import { BuildMilestoneNotFoundError, CourseStageNotFoundError, InvalidSlugFormatError, SlugConflictError } from "./errors";
import { isValidSlugFormat } from "./is-valid-slug-format";

export type LessonInput = {
  slug: string;
  title: string;
  type: Lesson["type"];
  isRequired: boolean;
  buildMilestoneId: string | null;
};

/**
 * ADM-003 — appends a new lesson at the end of its stage's current lesson
 * order. `slug` is unique per course (not per stage, since the learner-facing
 * route is `/learn/[courseSlug]/[lessonSlug]`), reusing the same slug format
 * rule as course/bundle (Wave 7b-i). `buildMilestoneId`, if given, must
 * reference a milestone that actually belongs to this lesson's course.
 */
export async function createLesson(courseStageId: string, input: LessonInput): Promise<Lesson> {
  if (!isValidSlugFormat(input.slug)) throw new InvalidSlugFormatError();

  const [stage] = await db.select().from(courseStages).where(eq(courseStages.id, courseStageId)).limit(1);
  if (!stage) throw new CourseStageNotFoundError();

  if (input.buildMilestoneId) {
    const [milestone] = await db
      .select({ id: buildMilestones.id })
      .from(buildMilestones)
      .where(and(eq(buildMilestones.id, input.buildMilestoneId), eq(buildMilestones.courseId, stage.courseId)))
      .limit(1);
    if (!milestone) throw new BuildMilestoneNotFoundError();
  }

  const [slugTaken] = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(and(eq(lessons.slug, input.slug), eq(lessons.courseId, stage.courseId)))
    .limit(1);
  if (slugTaken) throw new SlugConflictError();

  const [{ value: lessonCount }] = await db.select({ value: count() }).from(lessons).where(eq(lessons.courseStageId, courseStageId));

  const [created] = await db
    .insert(lessons)
    .values({
      courseId: stage.courseId,
      courseStageId,
      slug: input.slug,
      title: input.title,
      type: input.type,
      isRequired: input.isRequired,
      buildMilestoneId: input.buildMilestoneId,
      position: lessonCount + 1,
      content: [],
    })
    .returning();
  return created;
}
