"use server";

import { requireAdmin } from "@dirakitpro/auth";
import { revalidatePath } from "next/cache";
import { InvalidLessonContentError } from "@/features/admin/errors";
import { parseLessonContentJson } from "@/features/admin/parse-lesson-content-json";
import { updateLessonContent } from "@/features/admin/update-lesson-content";
import type { LessonContentEditorState } from "./lesson-content-editor";

/**
 * Re-checks requireAdmin() itself — reachable via direct POST outside the
 * layout guard (ADM-001). Handles both "Preview" and "Save" (dispatched by
 * the `intent` field the submit button includes natively) through the same
 * validation path, so both get an identical clear inline error on invalid
 * JSON instead of Save ever throwing an uncaught error.
 */
export async function submitLessonContentAction(
  courseId: string,
  lessonId: string,
  _prevState: LessonContentEditorState,
  formData: FormData,
): Promise<LessonContentEditorState> {
  await requireAdmin();

  const intent = String(formData.get("intent") ?? "preview");
  const rawContentJson = String(formData.get("content") ?? "");

  let blocks;
  try {
    blocks = parseLessonContentJson(rawContentJson);
  } catch (error) {
    if (error instanceof InvalidLessonContentError) return { blocks: [], error: error.message, saved: false };
    throw error;
  }

  if (intent !== "save") return { blocks, error: null, saved: false };

  await updateLessonContent(lessonId, rawContentJson);
  revalidatePath(`/admin/courses/${courseId}/curriculum/lessons/${lessonId}`);
  return { blocks, error: null, saved: true };
}
