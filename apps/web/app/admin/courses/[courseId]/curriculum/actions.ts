"use server";

import { requireAdmin } from "@dirakitpro/auth";
import { revalidatePath } from "next/cache";
import { createCourseStage } from "@/features/admin/create-course-stage";
import { createLesson, type LessonInput } from "@/features/admin/create-lesson";
import { deleteCourseStage } from "@/features/admin/delete-course-stage";
import { deleteLesson } from "@/features/admin/delete-lesson";
import { getCurriculumForAdmin } from "@/features/admin/get-curriculum-for-admin";
import { reorderCourseStages } from "@/features/admin/reorder-course-stages";
import { reorderLessons } from "@/features/admin/reorder-lessons";
import { updateCourseStage } from "@/features/admin/update-course-stage";
import { updateLesson } from "@/features/admin/update-lesson";

type Direction = "up" | "down";

function moveInArray<T>(items: T[], index: number, direction: Direction): T[] {
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return items;

  const reordered = [...items];
  [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
  return reordered;
}

function revalidateCurriculum(courseId: string): void {
  revalidatePath(`/admin/courses/${courseId}/curriculum`);
}

function textField(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

/** Every action here re-checks requireAdmin() itself — reachable via direct POST outside the layout guard (ADM-001). */
export async function addCourseStageAction(courseId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  await createCourseStage(courseId, textField(formData.get("title")));
  revalidateCurriculum(courseId);
}

export async function updateCourseStageAction(courseId: string, stageId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  await updateCourseStage(stageId, textField(formData.get("title")));
  revalidateCurriculum(courseId);
}

export async function deleteCourseStageAction(courseId: string, stageId: string): Promise<void> {
  await requireAdmin();

  await deleteCourseStage(stageId);
  revalidateCurriculum(courseId);
}

/**
 * "Up/down" is a UI convenience, not a domain rule — reorderCourseStages'
 * actual contract is "take the full explicit order" (ADM-003 explicitly
 * rules out drag-and-drop, not full-order semantics). This computes that
 * full order from the current one and a single swap.
 */
export async function moveCourseStageAction(courseId: string, stageId: string, direction: Direction): Promise<void> {
  await requireAdmin();

  const { stages } = await getCurriculumForAdmin(courseId);
  const currentOrder = stages.map((stage) => stage.id);
  const index = currentOrder.indexOf(stageId);
  if (index === -1) return;

  await reorderCourseStages(courseId, moveInArray(currentOrder, index, direction));
  revalidateCurriculum(courseId);
}

function lessonInputFromFormData(formData: FormData): LessonInput {
  const buildMilestoneId = textField(formData.get("buildMilestoneId"));
  return {
    slug: textField(formData.get("slug")),
    title: textField(formData.get("title")),
    type: textField(formData.get("type")) as LessonInput["type"],
    isRequired: formData.get("isRequired") === "on",
    buildMilestoneId: buildMilestoneId.length > 0 ? buildMilestoneId : null,
  };
}

export async function addLessonAction(courseId: string, courseStageId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  await createLesson(courseStageId, lessonInputFromFormData(formData));
  revalidateCurriculum(courseId);
}

export async function updateLessonMetadataAction(courseId: string, lessonId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  await updateLesson(lessonId, lessonInputFromFormData(formData));
  revalidateCurriculum(courseId);
}

export async function deleteLessonAction(courseId: string, lessonId: string): Promise<void> {
  await requireAdmin();

  await deleteLesson(lessonId);
  revalidateCurriculum(courseId);
}

export async function moveLessonAction(
  courseId: string,
  courseStageId: string,
  lessonId: string,
  direction: Direction,
): Promise<void> {
  await requireAdmin();

  const { stages } = await getCurriculumForAdmin(courseId);
  const stage = stages.find((s) => s.id === courseStageId);
  if (!stage) return;

  const currentOrder = stage.lessons.map((lesson) => lesson.id);
  const index = currentOrder.indexOf(lessonId);
  if (index === -1) return;

  await reorderLessons(courseStageId, moveInArray(currentOrder, index, direction));
  revalidateCurriculum(courseId);
}
