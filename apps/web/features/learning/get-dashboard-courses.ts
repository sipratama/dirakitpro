import "server-only";
import { courseStages, courses, db, enrollments } from "@dirakitpro/database";
import { and, eq, inArray } from "drizzle-orm";
import { getBuildProgress, type BuildProgressSummary } from "./get-build-progress";
import { getResumeLesson } from "./get-resume-lesson";

export type DashboardCourse = {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  buildProgress: BuildProgressSummary;
  currentStageName: string | null;
  resumeLessonSlug: string | null;
};

/**
 * LEARNING_WORKSPACE.md §1: one row per enrolled course, resume lesson +
 * its stage name for "Lanjut Merakit". Fetches Build Progress/resume lesson
 * per course rather than one big joined query — the dashboard lists a
 * learner's own enrollments, which is a small N in practice, so the simpler
 * per-course composition of the existing headless functions was chosen over
 * a hand-rolled aggregate query.
 */
export async function getDashboardCourses(userId: string): Promise<DashboardCourse[]> {
  const enrolled = await db
    .select({ course: courses })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(and(eq(enrollments.userId, userId), inArray(enrollments.status, ["ACTIVE", "COMPLETED"])));

  return Promise.all(
    enrolled.map(async ({ course }) => {
      const [buildProgress, resumeLesson] = await Promise.all([
        getBuildProgress(userId, course.id),
        getResumeLesson(userId, course.id),
      ]);

      let currentStageName: string | null = null;
      if (resumeLesson) {
        const [stage] = await db
          .select()
          .from(courseStages)
          .where(eq(courseStages.id, resumeLesson.courseStageId))
          .limit(1);
        currentStageName = stage?.title ?? null;
      }

      return {
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        buildProgress,
        currentStageName,
        resumeLessonSlug: resumeLesson?.slug ?? null,
      };
    }),
  );
}
