/**
 * Slug Utility Functions
 * Generate URL-friendly slugs from strings
 */

/**
 * Convert a string to a URL-friendly slug
 */
export const generateSlug = (text: string): string => {
  return text
    .toString()
    .normalize('NFD') // Split accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate a unique slug with random suffix
 */
export const generateUniqueSlug = (text: string): string => {
  const baseSlug = generateSlug(text);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomSuffix}`;
};
