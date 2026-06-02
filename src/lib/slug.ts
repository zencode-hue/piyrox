/**
 * PIYROX Market — Slug Generator
 *
 * Generates URL-friendly slugs from product titles.
 */

/**
 * Convert a string to a URL-friendly slug.
 *
 * Examples:
 *   "Netflix Premium 4K"    → "netflix-premium-4k"
 *   "ChatGPT Plus (Monthly)" → "chatgpt-plus-monthly"
 *   "NordVPN — 1 Year Plan" → "nordvpn-1-year-plan"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace common special chars with words
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    // Replace non-alphanumeric chars (except hyphens) with hyphens
    .replace(/[^a-z0-9-]+/g, "-")
    // Collapse multiple hyphens
    .replace(/-{2,}/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, "");
}

/**
 * Generate a unique slug by appending a numeric suffix if needed.
 * Requires a checker function that returns true if the slug already exists.
 */
export async function generateUniqueSlug(
  title: string,
  existsChecker: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (await existsChecker(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    // Safety valve
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return slug;
}
