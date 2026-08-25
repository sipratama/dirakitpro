// Deliberately used for both "project doesn't exist" and "project belongs to
// someone else" so callers can't distinguish the two (PRJ-003, same principle
// as commerce's OrderOwnershipError).
export class ProjectOwnershipError extends Error {
  constructor(message = "Project not found.") {
    super(message);
    this.name = "ProjectOwnershipError";
  }
}

// PROJECT_SHOWCASE.md §2.2: visibility can only be set to PUBLIC once the
// workflow state is SUBMITTED.
export class ProjectNotSubmittedError extends Error {
  constructor(message = "Project must be submitted before it can be made public.") {
    super(message);
    this.name = "ProjectNotSubmittedError";
  }
}
