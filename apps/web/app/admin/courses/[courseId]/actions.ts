"use server";

import { requireAdmin } from "@dirakitpro/auth";
import { revalidatePath } from "next/cache";
import { parseCourseFormData } from "../parse-course-form";
import { publishCourse } from "@/features/admin/publish-course";
import { unpublishCourse } from "@/features/admin/unpublish-course";
import { updateCourse } from "@/features/admin/update-course";

/** Every action here re-checks requireAdmin() itself — reachable via direct POST outside the layout guard (ADM-001). */
export async function updateCourseAction(courseId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const input = parseCourseFormData(formData);
  await updateCourse(courseId, input);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
}

export async function publishCourseAction(courseId: string): Promise<void> {
  const admin = await requireAdmin();

  await publishCourse(courseId, admin.id);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
}

export async function unpublishCourseAction(courseId: string): Promise<void> {
  const admin = await requireAdmin();

  await unpublishCourse(courseId, admin.id);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
}
