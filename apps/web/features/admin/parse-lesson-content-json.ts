import { isContentBlock, type ContentBlock } from "@/features/learning/content-block";
import { InvalidLessonContentError } from "./errors";

/**
 * CURRICULUM_MANAGEMENT.md §3 — shared by both the actual save
 * (`updateLessonContent`) and the preview round-trip (no DB write, just this
 * same validation echoed back) so "what saves" and "what previews" can never
 * silently disagree. Validates against the exact `isContentBlock` guard
 * `ContentBlockRenderer` uses (features/learning/content-block.ts), not a
 * separately maintained schema.
 */
export function parseLessonContentJson(rawContentJson: string): ContentBlock[] {
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

  return parsed as ContentBlock[];
}
