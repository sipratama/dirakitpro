"use server";

import { requireAdmin } from "@dirakitpro/auth";
import { redirect } from "next/navigation";
import { parseCourseFormData } from "../parse-course-form";
import { createCourse } from "@/features/admin/create-course";

/** Re-checks requireAdmin() itself — reachable via direct POST outside the layout guard (ADM-001). */
export async function createCourseAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const input = parseCourseFormData(formData);
  const created = await createCourse(input);
  redirect(`/admin/courses/${created.id}`);
}
