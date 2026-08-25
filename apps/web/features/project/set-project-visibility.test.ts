import { courses, db, enrollments, projects, type NewCourse, users } from "@dirakitpro/database";
import { eq, inArray } from "drizzle-orm";
import { grantEnrollment } from "../commerce/grant-enrollment";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectNotSubmittedError, ProjectOwnershipError } from "./errors";
import { setProjectVisibility } from "./set-project-visibility";
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

const COMPLETE_SUBMISSION: ProjectSubmissionInput = {
  title: "Personal Website Saya",
  description: "Website portofolio pribadi",
  features: [],
  technologies: [],
  liveUrl: "https://example.com",
  screenshotUrl: "https://placehold.co/800x600",
  repositoryUrl: null,
  notes: "Sudah live di Vercel.",
};

async function createProject(learnerId: string, courseId: string) {
  await grantEnrollment(learnerId, courseId);
  const [project] = await db.select().from(projects).where(eq(projects.userId, learnerId));
  return project;
}

describe("setProjectVisibility", () => {
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

  it("rejects going PUBLIC while the project is still DRAFT", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const project = await createProject(learner.id, course.id);

    await expect(setProjectVisibility(project.id, learner.id, "PUBLIC")).rejects.toThrow(ProjectNotSubmittedError);
  });

  it("sets PUBLIC and UNREVIEWED with a publishedAt timestamp once SUBMITTED", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const project = await createProject(learner.id, course.id);
    await updateProjectSubmission(project.id, learner.id, COMPLETE_SUBMISSION);

    const result = await setProjectVisibility(project.id, learner.id, "PUBLIC");

    expect(result.visibility).toBe("PUBLIC");
    expect(result.moderationStatus).toBe("UNREVIEWED");
    expect(result.publishedAt).not.toBeNull();
  });

  it("does not reset moderationStatus to UNREVIEWED when re-toggling PUBLIC after a prior APPROVED", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const project = await createProject(learner.id, course.id);
    await updateProjectSubmission(project.id, learner.id, COMPLETE_SUBMISSION);
    await setProjectVisibility(project.id, learner.id, "PUBLIC");
    await db.update(projects).set({ moderationStatus: "APPROVED" }).where(eq(projects.id, project.id));

    await setProjectVisibility(project.id, learner.id, "PRIVATE");
    const result = await setProjectVisibility(project.id, learner.id, "PUBLIC");

    expect(result.visibility).toBe("PUBLIC");
    expect(result.moderationStatus).toBe("APPROVED");
  });

  it("resets moderationStatus to UNREVIEWED when re-toggling PUBLIC after a prior REJECTED", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const learner = await insertLearner();
    userIds.push(learner.id);
    const project = await createProject(learner.id, course.id);
    await updateProjectSubmission(project.id, learner.id, COMPLETE_SUBMISSION);
    await setProjectVisibility(project.id, learner.id, "PUBLIC");
    await db.update(projects).set({ moderationStatus: "REJECTED" }).where(eq(projects.id, project.id));

    await setProjectVisibility(project.id, learner.id, "PRIVATE");
    const result = await setProjectVisibility(project.id, learner.id, "PUBLIC");

    expect(result.moderationStatus).toBe("UNREVIEWED");
  });

  it("rejects a non-owner with the same ownership error as a nonexistent project", async () => {
    const course = await insertCourse();
    courseIds.push(course.id);
    const owner = await insertLearner();
    const intruder = await insertLearner();
    userIds.push(owner.id, intruder.id);
    const project = await createProject(owner.id, course.id);

    await expect(setProjectVisibility(project.id, intruder.id, "PRIVATE")).rejects.toThrow(ProjectOwnershipError);
    await expect(setProjectVisibility("00000000-0000-0000-0000-000000000000", owner.id, "PRIVATE")).rejects.toThrow(
      ProjectOwnershipError,
    );
  });
});
