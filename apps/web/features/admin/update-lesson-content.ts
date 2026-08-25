import "server-only";
import { db, lessons, type Lesson } from "@dirakitpro/database";
import { eq } from "drizzle-orm";
import { isContentBlock, type ContentBlock } from "@/features/learning/content-block";
import { InvalidLessonContentError, LessonNotFoundError } from "./errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * CURRICULUM_MANAGEMENT.md §3 — parses and validates admin-submitted JSON
 * against the exact same `isContentBlock` guard `ContentBlockRenderer` uses
 * (features/learning/content-block.ts), not a separately maintained schema.
 * Validation happens fully before any DB write, so an invalid submission
 * never touches the stored `content` — it's all-or-nothing, never a partial
 * save. A block with a `type` outside the known set (e.g. a future video
 * provider isn't a `type` — that's a valid `video` block regardless of
 * `provider` — so this only rejects genuinely unrecognized block shapes) is
 * what makes this reject, not stricter per-field checks; per-type field
 * shape is intentionally not deep-validated here, matching the shallow guard
 * the renderer itself relies on.
 */
export async function updateLessonContent(lessonId: string, rawContentJson: string): Promise<Lesson> {
  if (!UUID_PATTERN.test(lessonId)) throw new LessonNotFoundError();

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContentJson);
  } catch {
    throw new InvalidLessonContentError("Invalid JSON — could not be parsed.");
  }

  if (!Array.isArray(parsed)) {
    throw new InvalidLessonContentError("Lesson content must be a JSON array.");
  }

  parsed.forEach((block, index) => {
    if (!isContentBlock(block)) {
      throw new InvalidLessonContentError(`Block at index ${index} is missing a "type" or has an unrecognized one.`);
    }
  });

  const content = parsed as ContentBlock[];

  const [updated] = await db.update(lessons).set({ content }).where(eq(lessons.id, lessonId)).returning();
  if (!updated) throw new LessonNotFoundError();
  return updated;
}
