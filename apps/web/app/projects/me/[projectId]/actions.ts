"use server";

import { getCurrentUser } from "@dirakitpro/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setProjectVisibility } from "@/features/project/set-project-visibility";
import { updateProjectSubmission, type ProjectSubmissionInput } from "@/features/project/update-project-submission";

function splitLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function textField(value: FormDataEntryValue | null): string | null {
  const trimmed = String(value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Re-checks auth and, inside `updateProjectSubmission`, ownership — Server
 * Actions are reachable via direct POST outside this page's form, so the
 * `projectId` bound from the page is only a reference, never trusted alone.
 */
export async function updateProjectSubmissionAction(projectId: string, formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const input: ProjectSubmissionInput = {
    title: textField(formData.get("title")),
    description: textField(formData.get("description")),
    features: splitLines(formData.get("features")),
    technologies: splitLines(formData.get("technologies")),
    liveUrl: textField(formData.get("liveUrl")),
    screenshotUrl: textField(formData.get("screenshotUrl")),
    repositoryUrl: textField(formData.get("repositoryUrl")),
    notes: textField(formData.get("notes")),
  };

  await updateProjectSubmission(projectId, user.id, input);
  revalidatePath(`/projects/me/${projectId}`);
}

export async function setProjectVisibilityAction(projectId: string, visibility: "PRIVATE" | "PUBLIC"): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await setProjectVisibility(projectId, user.id, visibility);
  revalidatePath(`/projects/me/${projectId}`);
}
