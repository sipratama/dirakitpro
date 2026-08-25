const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Shared slug-format rule for admin-authored entities (course/bundle, ADM-002/ADM-004): lowercase letters, digits, single hyphens between segments, no leading/trailing hyphen. */
export function isValidSlugFormat(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}
