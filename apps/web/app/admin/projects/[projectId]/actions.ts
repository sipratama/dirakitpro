"use server";

import { requireAdmin } from "@dirakitpro/auth";
import { revalidatePath } from "next/cache";
import { moderateProject, type ModerationAction } from "@/features/admin/moderate-project";
import { toggleProjectFeatured } from "@/features/admin/toggle-project-featured";

/**
 * Re-checks `requireAdmin()` itself: the layout guard only protects page
 * rendering, not this Server Action, which is reachable via direct POST
 * (ADM-001 — "mutation" is explicitly in scope, not only "route").
 */
export async function moderateProjectAction(projectId: string, action: ModerationAction, formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const reason = String(formData.get("reason") ?? "").trim() || undefined;
  await moderateProject(admin.id, projectId, action, reason);

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
  revalidatePath("/admin");
}

export async function toggleProjectFeaturedAction(projectId: string, isFeatured: boolean): Promise<void> {
  const admin = await requireAdmin();

  await toggleProjectFeatured(admin.id, projectId, isFeatured);

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
}
