"use server";

import { getCurrentUser } from "@dirakitpro/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deriveBuildMilestoneCompletion } from "@/features/learning/derive-build-milestone-completion";
import { getEnrollmentAccess } from "@/features/learning/get-enrollment-access";
import { getLessonBySlug } from "@/features/learning/get-lesson-by-slug";
import { markLessonComplete } from "@/features/learning/mark-lesson-complete";

/**
 * Takes only slugs (a reference) and re-derives the user, enrollment, and
 * lesson row itself from the server session — a Server Action is a public
 * POST endpoint reachable outside this page's UI, so none of the identity or
 * ownership checks can be trusted from the client (LRN-005, BLD-002).
 */
export async function markLessonCompleteAction(courseSlug: string, lessonSlug: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const access = await getEnrollmentAccess(user.id, courseSlug);
  if (!access) redirect(`/courses/${courseSlug}`);

  const lesson = await getLessonBySlug(access.course.id, lessonSlug);
  if (!lesson) return;

  await markLessonComplete(user.id, lesson.id);
  if (lesson.buildMilestoneId) {
    await deriveBuildMilestoneCompletion(user.id, lesson.buildMilestoneId);
  }

  revalidatePath(`/learn/${courseSlug}/${lessonSlug}`);
  revalidatePath(`/learn/${courseSlug}`);
  revalidatePath("/dashboard");
}
