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

export class CourseNotFoundError extends Error {
  constructor(message = "Course not found.") {
    super(message);
    this.name = "CourseNotFoundError";
  }
}

// Shared between course and bundle authoring (ADM-002/ADM-004) — both entities
// have an admin-chosen unique slug with the same format rule.
export class InvalidSlugFormatError extends Error {
  constructor(message = "Slug must be lowercase letters, numbers, and single hyphens between segments.") {
    super(message);
    this.name = "InvalidSlugFormatError";
  }
}

export class SlugConflictError extends Error {
  constructor(message = "This slug is already in use.") {
    super(message);
    this.name = "SlugConflictError";
  }
}

// Same shape as InvalidSlugFormatError — a single-field format check on an
// optional URL (course thumbnailUrl), mirroring isHttpUrl's usage in
// features/project (PRJ-002) but as a hard reject here since course
// create/update is a single full-form submission, not a partial-save
// workflow that needs to tolerate an incomplete field.
export class InvalidThumbnailUrlError extends Error {
  constructor(message = "thumbnailUrl must be a valid http(s) URL.") {
    super(message);
    this.name = "InvalidThumbnailUrlError";
  }
}

// Same shape again — course.resources editing (LRN-007) is scoped in this
// wave's admin UI to `resource_link` blocks only (label + http(s) URL),
// parsed one-per-line as "Label | URL". A malformed line is a hard reject,
// not a silently dropped row.
export class InvalidResourceLineError extends Error {
  constructor(message = 'Each resource line must be "Label | https://...".') {
    super(message);
    this.name = "InvalidResourceLineError";
  }
}

// COM-001 acceptance: a paid (non-FREE) course cannot publish without a valid
// price > 0. Checked explicitly at the publish call site, not only relied on
// as a DB constraint.
export class CoursePriceInvalidError extends Error {
  constructor(message = "A paid course requires a valid price greater than zero to publish.") {
    super(message);
    this.name = "CoursePriceInvalidError";
  }
}

export class BundleNotFoundError extends Error {
  constructor(message = "Bundle not found.") {
    super(message);
    this.name = "BundleNotFoundError";
  }
}

// COM-005: CHOOSE_N requires selectionCount; FIXED must not have one.
export class SelectionCountRequiredError extends Error {
  constructor(message = "CHOOSE_N bundles require a selectionCount.") {
    super(message);
    this.name = "SelectionCountRequiredError";
  }
}

export class SelectionCountMustBeNullError extends Error {
  constructor(message = "FIXED bundles must not have a selectionCount.") {
    super(message);
    this.name = "SelectionCountMustBeNullError";
  }
}

// A bundle's type is locked once it has ever been ACTIVE — an order may
// already reference it under the original type's semantics (COM-004/COM-005),
// so silently changing FIXED<->CHOOSE_N after that point could desync
// historical orders from what the bundle now means. DRAFT bundles (never
// activated) can still freely change type.
export class BundleTypeLockedError extends Error {
  constructor(message = "Bundle type cannot change once the bundle has ever been ACTIVE.") {
    super(message);
    this.name = "BundleTypeLockedError";
  }
}

// 10.3: INACTIVE -> ACTIVE reactivation (and initial DRAFT -> ACTIVE
// activation) both require the campaign window to currently hold — reject
// explicitly rather than silently activating an already-expired campaign.
export class BundleCampaignWindowExpiredError extends Error {
  constructor(message = "This bundle's campaign window is not currently valid.") {
    super(message);
    this.name = "BundleCampaignWindowExpiredError";
  }
}

// 10.3's transition table only allows DRAFT -> ACTIVE for first activation.
export class BundleNotDraftError extends Error {
  constructor(message = "Only a DRAFT bundle can be activated.") {
    super(message);
    this.name = "BundleNotDraftError";
  }
}

// 10.3's transition table only allows ACTIVE -> INACTIVE for manual deactivation.
export class BundleNotActiveError extends Error {
  constructor(message = "Only an ACTIVE bundle can be deactivated.") {
    super(message);
    this.name = "BundleNotActiveError";
  }
}

// 10.3's transition table only allows INACTIVE -> ACTIVE for reactivation —
// there is no listed path back to ACTIVE from EXPIRED.
export class BundleNotInactiveError extends Error {
  constructor(message = "Only an INACTIVE bundle can be reactivated.") {
    super(message);
    this.name = "BundleNotInactiveError";
  }
}

export class CourseStageNotFoundError extends Error {
  constructor(message = "Stage not found.") {
    super(message);
    this.name = "CourseStageNotFoundError";
  }
}

// Deliberate choice (CURRICULUM_MANAGEMENT.md doesn't specify): reject rather
// than cascade, even though the DB FK on lessons.courseStageId is itself
// ON DELETE CASCADE. A stage can hold many lessons, and each may already
// have learner LessonProgress against it — a single "delete stage" click
// silently discarding all of that is a much bigger, easier-to-fumble blast
// radius than a single lesson delete. Same conservative spirit as
// BuildMilestoneInUseError below, applied consistently even though the PRD
// only mandated it for milestones.
export class CourseStageNotEmptyError extends Error {
  constructor(message = "This stage still has lessons — remove or move them first.") {
    super(message);
    this.name = "CourseStageNotEmptyError";
  }
}

export class LessonNotFoundError extends Error {
  constructor(message = "Lesson not found.") {
    super(message);
    this.name = "LessonNotFoundError";
  }
}

// A lesson's buildMilestoneId must reference a real milestone belonging to
// the same course — same shape as validating slug/thumbnailUrl at the
// function level rather than only via a DB FK error.
export class BuildMilestoneNotFoundError extends Error {
  constructor(message = "Milestone not found for this course.") {
    super(message);
    this.name = "BuildMilestoneNotFoundError";
  }
}

// ADM-003/CURRICULUM_MANAGEMENT.md §4: deleting a milestone that lessons
// still reference must not silently cascade to `buildMilestoneId = null` —
// that would quietly break BLD-002's CHECKPOINT-driven derivation for
// learners already relying on it.
export class BuildMilestoneInUseError extends Error {
  constructor(message = "This milestone is still referenced by one or more lessons.") {
    super(message);
    this.name = "BuildMilestoneInUseError";
  }
}

// Shared by reorder-course-stages/reorder-lessons/reorder-build-milestones —
// the given id array must be exactly the current set for that scope (course
// or stage), no more, no fewer, so a stale client can't silently drop or
// smuggle in an id that doesn't belong.
export class ReorderSetMismatchError extends Error {
  constructor(message = "The given order doesn't match the current set of items.") {
    super(message);
    this.name = "ReorderSetMismatchError";
  }
}

// Fase 2 (CURRICULUM_MANAGEMENT.md §3): lesson content is admin-authored JSON,
// validated against the existing ContentBlock union (not a new schema) —
// invalid JSON or an unrecognized block `type` is a hard reject, and (per
// updateLessonContent's own contract) never a partial save.
export class InvalidLessonContentError extends Error {
  constructor(message = "Lesson content must be a JSON array of valid ContentBlock objects.") {
    super(message);
    this.name = "InvalidLessonContentError";
  }
}
