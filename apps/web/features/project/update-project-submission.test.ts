import { courses, db, enrollments, projects, type NewCourse, users } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { grantEnrollment } from "../commerce/grant-enrollment";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectOwnershipError } from "./errors";
import { updateProjectSubmission, type ProjectSubmissionInput } from "./update-project-submission";

function uniqueSlug(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

async function insertCourse(overrides: Partial<NewCourse> = {}) {
  const [course] = await db
    .insert(courses)
    .values({
      slug: uniqueSlug("test-course"),
      title: "Test Course",
      outcomeDescription: "Outcome",
      description: "Description",
      status: "PUBLISHED",
      price: "0",
      ...overrides,
    })
    .returning();
  return course;
}

async function insertLearner() {
  const [user] = await db
    .insert(users)
    .values({
      email: `${uniqueSlug("learner")}@example.com`,
      username: uniqueSlug("learner"),
      displayName: "Test Learner",
      role: "LEARNER",
    })
    .returning();
  return user;
}

const EMPTY_SUBMISSION: ProjectSubmissionInput = {
  title: null,
  description: null,
  features: [],
  technologies: [],
  liveUrl: null,
  screenshotUrl: null,
  repositoryUrl: null,
  notes: null,
};

const COMPLETE_SUBMISSION: ProjectSubmissionInput = {
  title: "Personal Website Saya",
  description: "Website portofolio pribadi",
  features: ["Responsive", "Dark mode"],
  technologies: ["HTML", "CSS"],
  liveUrl: "https://example.com",
  screenshotUrl: "https://placehold.co/800x600",
  repositoryUrl: "https://github.com/example/repo",
  notes: "Sudah live di Vercel.",
};

async function createProject(learnerId: string, courseId: string) {
  await grantEnrollment(learnerId, courseId);
  const [project] = await db.select().from(projects).where(eq(projects.userId, learnerId));
  return project;
}

describe("updateProjectSubmission", () => {
  const courseIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    if (userIds.length) await db.delete(projects).where(inArray(projects.userId, userIds));
    if (userIds.length) await db.delete(enrollments).where(inArray(enrollments.userId, userIds));
    if (courseIds.length) await db.delete(courses).where(inArray(courses.id, courseIds));
    if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
    courseIds.length = 0;
    userIds.length = 0;
  });

  it("stays DRAFT and still saves partial fields when the submission is incomplete", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const project = await createProject(learner.id, course.id);

    const result = await updateProjectSubmission(project.id, learner.id, {
      ...EMPTY_SUBMISSION,
      liveUrl: "https://example.com",
      description: "Draft in progress",
    });

    expect(result.status).toBe("DRAFT");
    expect(result.liveUrl).toBe("https://example.com");
    expect(result.description).toBe("Draft in progress");
  });

  it("transitions to SUBMITTED once live URL, screenshot, and notes are all valid", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const project = await createProject(learner.id, course.id);

    const result = await updateProjectSubmission(project.id, learner.id, COMPLETE_SUBMISSION);

    expect(result.status).toBe("SUBMITTED");
    expect(result.submittedAt).not.toBeNull();
  });

  it("does not transition to SUBMITTED when notes are missing, even with valid URLs", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const project = await createProject(learner.id, course.id);

    const result = await updateProjectSubmission(project.id, learner.id, { ...COMPLETE_SUBMISSION, notes: "" });

    expect(result.status).toBe("DRAFT");
  });

  it("does not transition to SUBMITTED when the live URL is malformed", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const project = await createProject(learner.id, course.id);

    const result = await updateProjectSubmission(project.id, learner.id, { ...COMPLETE_SUBMISSION, liveUrl: "not-a-url" });

    expect(result.status).toBe("DRAFT");
  });

  it("stays SUBMITTED on a later edit even if a gating field is temporarily cleared (10.6)", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const project = await createProject(learner.id, course.id);
    const submitted = await updateProjectSubmission(project.id, learner.id, COMPLETE_SUBMISSION);

    const result = await updateProjectSubmission(project.id, learner.id, {
      ...COMPLETE_SUBMISSION,
      liveUrl: "https://example.com/v2",
    });

    expect(result.status).toBe("SUBMITTED");
    expect(result.submittedAt).toEqual(submitted.submittedAt);
  });

  it("rejects a non-owner with the same ownership error as a nonexistent project", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const owner = await insertLearner();
    const intruder = await insertLearner();
    userIds.push(owner.id, intruder.id);
    const project = await createProject(owner.id, course.id);

    await expect(updateProjectSubmission(project.id, intruder.id, COMPLETE_SUBMISSION)).rejects.toThrow(
      ProjectOwnershipError,
    );
    await expect(
      updateProjectSubmission("00000000-0000-0000-0000-000000000000", owner.id, COMPLETE_SUBMISSION),
    ).rejects.toThrow(ProjectOwnershipError);
  });
});
