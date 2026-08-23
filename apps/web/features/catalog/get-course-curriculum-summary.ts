import "server-only";
import { type Lesson, courseStages, db, lessons } from "@dirakitpro/database";
import { asc, eq } from "drizzle-orm";

export type CurriculumSummaryLesson = {
  id: string;
  title: string;
  type: Lesson["type"];
};

export type CurriculumSummaryStage = {
  id: string;
  title: string;
  lessons: CurriculumSummaryLesson[];
};

/**
 * Curriculum outline for the course detail page (CAT-002, 9.1 hierarchy):
 * stage → lesson title/type only, in course order. Deliberately selects only
 * these columns — `lessons.content` is never fetched here, let alone returned.
 * Content stays locked behind enrollment (LRN-006); the catalog only needs
 * the outline shape.
 */
export async function getCourseCurriculumSummary(courseId: string): Promise<CurriculumSummaryStage[]> {
  const rows = await db
    .select({
      stageId: courseStages.id,
      stageTitle: courseStages.title,
      lessonId: lessons.id,
      lessonTitle: lessons.title,
      lessonType: lessons.type,
    })
    .from(courseStages)
    .leftJoin(lessons, eq(lessons.courseStageId, courseStages.id))
    .where(eq(courseStages.courseId, courseId))
    .orderBy(asc(courseStages.position), asc(lessons.position));

  const stagesById = new Map<string, CurriculumSummaryStage>();

  for (const row of rows) {
    let stage = stagesById.get(row.stageId);
    if (!stage) {
      stage = { id: row.stageId, title: row.stageTitle, lessons: [] };
      stagesById.set(row.stageId, stage);
    }
    if (row.lessonId) {
      stage.lessons.push({ id: row.lessonId, title: row.lessonTitle!, type: row.lessonType! });
    }
  }

  return Array.from(stagesById.values());
}
