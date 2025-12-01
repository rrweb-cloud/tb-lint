/**
 * Utilities for case conversion and validation
 */

/**
 * Check if a string is in camelCase format
 * - Starts with lowercase letter
 * - Contains only letters and numbers
 * - May have uppercase letters in the middle (but not at start)
 */
export function isCamelCase(name: string): boolean {
  if (!name || name.length === 0) return false;

  // Must start with lowercase letter
  if (!/^[a-z]/.test(name)) return false;

  // Must contain only letters and numbers (no underscores, hyphens, etc.)
  if (!/^[a-z][a-zA-Z0-9]*$/.test(name)) return false;

  return true;
}

/**
 * Check if a string is in snake_case format
 * - All lowercase
 * - May contain underscores
 * - Must start with a letter
 */
export function isSnakeCase(name: string): boolean {
  if (!name || name.length === 0) return false;

  // Must start with lowercase letter
  if (!/^[a-z]/.test(name)) return false;

  // Must contain only lowercase letters, numbers, and underscores
  if (!/^[a-z][a-z0-9_]*$/.test(name)) return false;

  // Should not have consecutive underscores or trailing underscores
  if (/__/.test(name) || name.endsWith('_')) return false;

  return true;
}

/**
 * Convert camelCase to snake_case
 * Examples:
 * - userId -> user_id
 * - sessionId -> session_id
 * - createdAt -> created_at
 * - userIDToken -> user_id_token
 */
export function camelToSnake(name: string): string {
  if (!name) return name;

  return name
    // Insert underscore before uppercase letters that follow lowercase letters or numbers
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    // Insert underscore before uppercase letters that are followed by lowercase letters
    // This handles cases like "userIDToken" -> "user_ID_Token" -> "user_id_token"
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    // Convert to lowercase
    .toLowerCase();
}

/**
 * Convert snake_case to camelCase
 * Examples:
 * - user_id -> userId
 * - session_id -> sessionId
 * - created_at -> createdAt
 */
export function snakeToCamel(name: string): string {
  if (!name) return name;

  return name
    .toLowerCase()
    .replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
}

/**
 * Validate that a snake_case string matches the camelCase equivalent
 */
export function validateMapping(camelName: string, snakeName: string): boolean {
  return camelToSnake(camelName) === snakeName;
}
