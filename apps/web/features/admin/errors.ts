export class ProjectNotFoundError extends Error {
  constructor(message = "Project not found.") {
    super(message);
    this.name = "ProjectNotFoundError";
  }
}

// ADM-007 — reject/hide without a reason must fail at the function level,
// not only be enforced by a form's UI.
export class ModerationReasonRequiredError extends Error {
  constructor(message = "A reason is required to reject or hide a project.") {
    super(message);
    this.name = "ModerationReasonRequiredError";
  }
}

// Same shape as ProjectNotSubmittedError (features/project/errors.ts) — a
// project must be APPROVED before it can be featured (ADMIN_CORE.md §6).
export class ProjectNotApprovedError extends Error {
  constructor(message = "Project must be approved before it can be featured.") {
    super(message);
    this.name = "ProjectNotApprovedError";
  }
}
