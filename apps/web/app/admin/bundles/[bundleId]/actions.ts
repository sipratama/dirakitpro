"use server";

import { requireAdmin } from "@dirakitpro/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { activateBundle } from "@/features/admin/activate-bundle";
import { deactivateBundle } from "@/features/admin/deactivate-bundle";
import { reactivateBundle } from "@/features/admin/reactivate-bundle";
import { setBundleEligibleCourses } from "@/features/admin/set-bundle-eligible-courses";
import { updateBundle } from "@/features/admin/update-bundle";
import { parseBundleFormData } from "../parse-bundle-form";

/** Every action here re-checks requireAdmin() itself — reachable via direct POST outside the layout guard (ADM-001). */
export async function updateBundleAction(bundleId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const input = parseBundleFormData(formData);
  await updateBundle(bundleId, input);
  revalidatePath(`/admin/bundles/${bundleId}`);
  revalidatePath("/admin/bundles");
}

export async function activateBundleAction(bundleId: string): Promise<void> {
  const admin = await requireAdmin();

  await activateBundle(bundleId, admin.id);
  revalidatePath(`/admin/bundles/${bundleId}`);
  revalidatePath("/admin/bundles");
}

export async function deactivateBundleAction(bundleId: string): Promise<void> {
  const admin = await requireAdmin();

  await deactivateBundle(bundleId, admin.id);
  revalidatePath(`/admin/bundles/${bundleId}`);
  revalidatePath("/admin/bundles");
}

export async function reactivateBundleAction(bundleId: string): Promise<void> {
  const admin = await requireAdmin();

  await reactivateBundle(bundleId, admin.id);
  revalidatePath(`/admin/bundles/${bundleId}`);
  revalidatePath("/admin/bundles");
}

/**
 * A non-blocking warning (eligible count below selectionCount) has no
 * natural place in a `void`-returning Server Action, so it's threaded back
 * through a redirect query param instead of component state — the page
 * reads `?warning=` and displays it once.
 */
export async function setBundleEligibleCoursesAction(bundleId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const courseIds = formData.getAll("courseIds").map(String);
  const result = await setBundleEligibleCourses(bundleId, courseIds);
  revalidatePath(`/admin/bundles/${bundleId}`);
  revalidatePath("/admin/bundles");

  if (result.warning) {
    redirect(`/admin/bundles/${bundleId}?warning=${encodeURIComponent(result.warning)}`);
  }
  redirect(`/admin/bundles/${bundleId}`);
}
