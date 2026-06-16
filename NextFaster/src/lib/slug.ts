/**
 * Generate a URL-friendly slug from a string.
 * Handles Arabic and other non-Latin scripts by falling back to a
 * timestamp-based slug so the result is never empty or hyphen-only.
 *
 * @param name - The string to convert to a slug
 * @param fallback - Prefix used when name produces no Latin characters (default: 'item')
 * @returns A URL-friendly slug
 */
export const generateSlug = (name: string, fallback = 'item'): string => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // strip non-word chars (keeps a-z, 0-9, _, -, space)
    .replace(/\s+/g, '-')       // spaces → hyphens
    .replace(/-+/g, '-')        // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens

  // If Arabic (or other non-Latin) name left us with nothing usable, use the fallback
  return slug || fallback;
};
