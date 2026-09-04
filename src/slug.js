// URL-friendly string utilities.

/**
 * Convert a string into a URL slug.
 */
export function slugify(input, options = {}) {
  if (typeof input !== "string") {
    throw new TypeError("slugify input must be a string");
  }

  const maxLength = options?.maxLength ?? 60;
  const slug = input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length <= maxLength) {
    return slug;
  }

  const truncated = slug.slice(0, maxLength);
  const lastHyphen = truncated.lastIndexOf("-");

  return lastHyphen === -1 ? truncated : truncated.slice(0, lastHyphen);
}
