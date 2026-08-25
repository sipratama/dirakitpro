import "server-only";
import { buildMilestones, courseStages, db, lessons, type Lesson } from "@dirakitpro/database";
import { eq } from "drizzle-orm";

export type AdminLesson = {
  id: string;
  slug: string;
  title: string;
  type: Lesson["type"];
  isRequired: boolean;
  position: number;
  buildMilestoneId: string | null;
};

export type AdminStage = {
  id: string;
  title: string;
  position: number;
  lessons: AdminLesson[];
};

export type AdminMilestone = {
  id: string;
  title: string;
  position: number;
  isRequired: boolean;
};

export type CurriculumForAdmin = {
  stages: AdminStage[];
  milestones: AdminMilestone[];
};

/**
 * Full stage->lesson outline for `/admin/courses/[courseId]/curriculum`
 * (ADM-003). Unlike `getCourseWorkspaceOutline` (Wave 5), this is scoped to
 * the course, not a learner — no LessonProgress join, and not gated on the
 * course's publishing state (an admin edits DRAFT curriculum too). Also
 * returns the course's milestones, since the lesson form's
 * `buildMilestoneId` dropdown and the curriculum page's milestone section
 * both need the same list.
 */
export async function getCurriculumForAdmin(courseId: string): Promise<CurriculumForAdmin> {
  const [stageRows, lessonRows, milestoneRows] = await Promise.all([
    db.select().from(courseStages).where(eq(courseStages.courseId, courseId)).orderBy(courseStages.position),
    db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(lessons.position),
    db.select().from(buildMilestones).where(eq(buildMilestones.courseId, courseId)).orderBy(buildMilestones.position),
  ]);

  const lessonsByStageId = new Map<string, AdminLesson[]>();
  for (const lesson of lessonRows) {
    const entry: AdminLesson = {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      type: lesson.type,
      isRequired: lesson.isRequired,
      position: lesson.position,
      buildMilestoneId: lesson.buildMilestoneId,
    };
    const list = lessonsByStageId.get(lesson.courseStageId) ?? [];
    list.push(entry);
    lessonsByStageId.set(lesson.courseStageId, list);
  }

  return {
    stages: stageRows.map((stage) => ({
      id: stage.id,
      title: stage.title,
      position: stage.position,
      lessons: lessonsByStageId.get(stage.id) ?? [],
    })),
    milestones: milestoneRows.map((milestone) => ({
      id: milestone.id,
      title: milestone.title,
      position: milestone.position,
      isRequired: milestone.isRequired,
    })),
  };
}
