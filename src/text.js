// Small string utilities.

/**
 * Capitalize the first letter of a string.
 * capitalize("hello") === "Hello"
 * capitalize("") === ""      (empty string stays empty)
 */
export function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : "";
}
