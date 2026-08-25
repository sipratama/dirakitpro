import type { ContentBlock } from "@/features/learning/content-block";
import type { CourseInput } from "@/features/admin/create-course";
import { InvalidResourceLineError } from "@/features/admin/errors";
import { isHttpUrl } from "@/features/project/is-http-url";

function textField(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function optionalTextField(value: FormDataEntryValue | null): string | null {
  const trimmed = textField(value);
  return trimmed.length > 0 ? trimmed : null;
}

// Course resources (LRN-007) are scoped in this wave's admin form to
// `resource_link` blocks only — one per line, "Label | https://...". See
// InvalidResourceLineError for why a malformed line is a hard reject rather
// than silently dropped.
function parseResourceLines(value: FormDataEntryValue | null): ContentBlock[] {
  const lines = String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line) => {
    const separatorIndex = line.indexOf("|");
    if (separatorIndex === -1) throw new InvalidResourceLineError();

    const label = line.slice(0, separatorIndex).trim();
    const url = line.slice(separatorIndex + 1).trim();
    if (!label || !isHttpUrl(url)) throw new InvalidResourceLineError();

    return { type: "resource_link", label, url };
  });
}

/** Inverse of parseResourceLines, for pre-filling the edit form's textarea. */
export function serializeResourceLines(resources: unknown): string {
  if (!Array.isArray(resources)) return "";
  return resources
    .filter((block): block is { type: string; label?: string; url?: string } => !!block && typeof block === "object")
    .filter((block) => block.type === "resource_link")
    .map((block) => `${block.label} | ${block.url}`)
    .join("\n");
}

/** Shared by both /admin/courses/new and /admin/courses/[courseId] actions — same form shape, same parsing rules. */
export function parseCourseFormData(formData: FormData): CourseInput {
  return {
    slug: textField(formData.get("slug")),
    title: textField(formData.get("title")),
    outcomeDescription: textField(formData.get("outcomeDescription")),
    description: textField(formData.get("description")),
    difficulty: optionalTextField(formData.get("difficulty")),
    durationEstimate: optionalTextField(formData.get("durationEstimate")),
    thumbnailUrl: optionalTextField(formData.get("thumbnailUrl")),
    price: textField(formData.get("price")) || "0",
    currency: textField(formData.get("currency")) || "IDR",
    resources: parseResourceLines(formData.get("resources")),
  };
}
