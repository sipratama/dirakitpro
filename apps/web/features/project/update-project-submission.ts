import "server-only";
import { db, projects, type Project } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { ProjectOwnershipError } from "./errors";
import { isHttpUrl } from "./is-http-url";

export type ProjectSubmissionInput = {
  title: string | null;
  description: string | null;
  features: string[];
  technologies: string[];
  liveUrl: string | null;
  screenshotUrl: string | null;
  repositoryUrl: string | null;
  notes: string | null;
};

function isSubmissionReady(input: ProjectSubmissionInput): boolean {
  return (
    !!input.liveUrl &&
    isHttpUrl(input.liveUrl) &&
    !!input.screenshotUrl &&
    isHttpUrl(input.screenshotUrl) &&
    !!input.notes?.trim()
  );
}

/**
 * Saves submission fields and, separately, decides whether the workflow
 * state can advance (10.6/PRJ-002: DRAFT -> SUBMITTED once live URL,
 * screenshot, and notes are all valid — repository URL stays optional even at
 * SUBMITTED). Saving is never all-or-nothing: whatever the learner filled in
 * is persisted regardless of whether the full gate is met yet, so a
 * half-finished submission doesn't lose partial work.
 *
 * Once SUBMITTED, the state never regresses back to DRAFT from a later edit
 * (10.6: "learner may update submission fields after reaching SUBMITTED ...
 * without leaving the SUBMITTED state") — there's no rule that un-submits a
 * project just because a field was temporarily cleared.
 */
export async function updateProjectSubmission(
  projectId: string,
  userId: string,
  input: ProjectSubmissionInput,
): Promise<Project> {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project || project.userId !== userId) throw new ProjectOwnershipError();

  const shouldSubmit = project.status === "SUBMITTED" || isSubmissionReady(input);

  const [updated] = await db
    .update(projects)
    .set({
      title: input.title,
      description: input.description,
      features: input.features,
      technologies: input.technologies,
      liveUrl: input.liveUrl,
      screenshotUrl: input.screenshotUrl,
      repositoryUrl: input.repositoryUrl,
      notes: input.notes,
      status: shouldSubmit ? "SUBMITTED" : "DRAFT",
      submittedAt: shouldSubmit ? project.submittedAt ?? new Date() : project.submittedAt,
    })
    .where(eq(projects.id, projectId))
    .returning();

  return updated;
}
