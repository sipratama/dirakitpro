import type { BundleInput } from "@/features/admin/create-bundle";

function textField(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function optionalDate(value: FormDataEntryValue | null): Date | null {
  const trimmed = textField(value);
  return trimmed.length > 0 ? new Date(trimmed) : null;
}

/** Shared by both /admin/bundles/new and /admin/bundles/[bundleId] actions — same form shape, same parsing rules. */
export function parseBundleFormData(formData: FormData): BundleInput {
  const type = textField(formData.get("type")) === "CHOOSE_N" ? "CHOOSE_N" : "FIXED";
  const selectionCountRaw = textField(formData.get("selectionCount"));

  return {
    slug: textField(formData.get("slug")),
    title: textField(formData.get("title")),
    description: textField(formData.get("description")),
    type,
    selectionCount: type === "CHOOSE_N" && selectionCountRaw.length > 0 ? Number(selectionCountRaw) : null,
    price: textField(formData.get("price")) || "0",
    currency: textField(formData.get("currency")) || "IDR",
    startsAt: optionalDate(formData.get("startsAt")),
    endsAt: optionalDate(formData.get("endsAt")),
  };
}
