"use server";

import { requireAdmin } from "@dirakitpro/auth";
import { redirect } from "next/navigation";
import { createBundle } from "@/features/admin/create-bundle";
import { parseBundleFormData } from "../parse-bundle-form";

/** Re-checks requireAdmin() itself — reachable via direct POST outside the layout guard (ADM-001). */
export async function createBundleAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const input = parseBundleFormData(formData);
  const created = await createBundle(input);
  redirect(`/admin/bundles/${created.id}`);
}
